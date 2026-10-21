/**
 * Comprehensive Automated Test Suite for Meta WhatsApp Cloud API Integration
 */
const mongoose = require('mongoose');

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING META WHATSAPP CLOUD API TEST SUITE');
  console.log('====================================================\n');

  // Connect to MongoDB right away
  await mongoose.connect('mongodb://127.0.0.1:27017/school_erp');
  console.log('✅ Connected to MongoDB: school_erp\n');

  const whatsappCloudApiService = require('../services/whatsappCloudApiService');
  const WhatsAppMessageLog = require('../models/WhatsAppMessageLog');
  const chatController = require('../controllers/chatController');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // ─────────────────────────────────────────────────────────────
    // 1. Phone Number Normalization Tests
    // ─────────────────────────────────────────────────────────────
    console.log('👉 [1] Testing E.164 Phone Number Normalization...');
    const p1 = whatsappCloudApiService.normalizePhoneNumber('9559573669');
    assert(p1 === '919559573669', '10-digit Indian number correctly prefixed with 91');

    const p2 = whatsappCloudApiService.normalizePhoneNumber('+91 98765-43210');
    assert(p2 === '919876543210', 'Formatted +91 number stripped to clean digits');

    const p3 = whatsappCloudApiService.normalizePhoneNumber('09876543210');
    assert(p3 === '919876543210', '11-digit number with leading 0 converted to 91');

    let threwOnShort = false;
    try {
      whatsappCloudApiService.normalizePhoneNumber('12345');
    } catch (e) {
      threwOnShort = true;
    }
    assert(threwOnShort, 'Too short number (< 8 digits) properly rejected with error');

    // ─────────────────────────────────────────────────────────────
    // 2. Token Masking Security Test
    // ─────────────────────────────────────────────────────────────
    console.log('\n👉 [2] Testing Access Token Masking...');
    const secret = 'EAABwz1234567890abcdefghijklmnopqrstuvwxyz';
    const masked = whatsappCloudApiService.maskToken(secret);
    assert(masked.startsWith('EAABwz') && masked.endsWith('wxyz') && masked.includes('••••••••'), 'Access token is safely masked without leaking secret');
    assert(!masked.includes('1234567890abcdef'), 'Middle of access token is completely hidden');

    // ─────────────────────────────────────────────────────────────
    // 3. Missing Credentials / API Error Safety Test
    // ─────────────────────────────────────────────────────────────
    console.log('\n👉 [3] Testing Unconfigured / Missing Credentials Safety...');
    let errorCaught = false;
    let errorMsg = '';
    try {
      await whatsappCloudApiService.sendTextMessage('919876543210', 'Hello Test');
    } catch (err) {
      errorCaught = true;
      errorMsg = err.message;
    }
    assert(errorCaught, 'Unconfigured sendTextMessage threw error (NEVER fake success)');
    assert(errorMsg.includes('not configured'), 'Error message informs admin to configure credentials');

    // ─────────────────────────────────────────────────────────────
    // 4. Meta Webhook Verification (GET hub.challenge) Test
    // ─────────────────────────────────────────────────────────────
    console.log('\n👉 [4] Testing Meta Webhook Verification (GET endpoint)...');
    const testChallenge = 'challenge_random_token_12345';
    let verifyStatus = 0;
    let verifyResponse = '';

    const mockReqValid = {
      query: {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'school_erp_meta_webhook_secret',
        'hub.challenge': testChallenge
      }
    };
    const mockResValid = {
      status(s) { verifyStatus = s; return this; },
      send(body) { verifyResponse = body; return this; },
      json(j) { verifyResponse = j; return this; }
    };

    await chatController.verifyWhatsAppWebhook(mockReqValid, mockResValid);
    assert(verifyStatus === 200, 'Webhook verification returns HTTP 200 on valid token');
    assert(verifyResponse === testChallenge, 'Webhook verification echoes raw hub.challenge back to Meta');

    // Test token mismatch
    let mismatchStatus = 0;
    const mockReqInvalid = {
      query: {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'wrong_token',
        'hub.challenge': testChallenge
      }
    };
    const mockResInvalid = {
      status(s) { mismatchStatus = s; return this; },
      json(j) { return this; },
      send(s) { return this; }
    };
    await chatController.verifyWhatsAppWebhook(mockReqInvalid, mockResInvalid);
    assert(mismatchStatus === 403, 'Webhook verification rejects invalid token with HTTP 403 Forbidden');

    // ─────────────────────────────────────────────────────────────
    // 5. Database Logging & Webhook Delivery Tracking Test
    // ─────────────────────────────────────────────────────────────
    console.log('\n👉 [5] Testing Database Persistence & Webhook Delivery Tracking...');
    const testWamid = `wamid.TEST_${Date.now()}`;
    const log = await WhatsAppMessageLog.create({
      wamid: testWamid,
      phone: '919559573669',
      recipientName: 'Test Student',
      senderName: 'School Admin',
      messageType: 'template',
      templateName: 'hello_world',
      status: 'accepted',
      statusHistory: [{ status: 'accepted', timestamp: new Date() }]
    });

    assert(log && log._id, 'WhatsAppMessageLog document created with status "accepted"');

    // Simulate Meta Webhook status payload (delivered)
    const webhookPayloadDelivered = {
      object: 'whatsapp_business_account',
      entry: [
        {
          id: 'WABA_12345',
          changes: [
            {
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                metadata: { display_phone_number: '919559573669', phone_number_id: '109823471928374' },
                statuses: [
                  {
                    id: testWamid,
                    status: 'delivered',
                    timestamp: String(Math.floor(Date.now() / 1000)),
                    recipient_id: '919559573669'
                  }
                ]
              }
            }
          ]
        }
      ]
    };

    const webhookResult = await whatsappCloudApiService.handleWebhookEvent(webhookPayloadDelivered);
    assert(webhookResult.processed && webhookResult.count === 1, 'Webhook event processed 1 status update');

    // Verify updated log in MongoDB
    const updatedLog = await WhatsAppMessageLog.findOne({ wamid: testWamid });
    assert(updatedLog.status === 'delivered', 'Log status transitioned from "accepted" to "delivered" via webhook');
    assert(updatedLog.statusHistory.length === 2, 'Status history contains both "accepted" and "delivered" entries');

    // Deduplication test: re-sending the same delivered status should not duplicate
    const dedupResult = await whatsappCloudApiService.handleWebhookEvent(webhookPayloadDelivered);
    assert(dedupResult.count === 0, 'Webhook deduplication avoided processing identical status transition twice');

    // Clean up test log
    await WhatsAppMessageLog.deleteOne({ _id: log._id });
    console.log('  Test log cleaned up.');

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    await mongoose.disconnect();
    console.log('  MongoDB disconnected cleanly.');
  }

  // ─────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────
  console.log('\n====================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
