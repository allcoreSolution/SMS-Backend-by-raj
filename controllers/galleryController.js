const GalleryAlbum = require('../models/GalleryAlbum');

const SEED_ALBUMS = [
  {
    title: '79th Independence Day & Flag Hoisting Ceremony',
    description: 'Ceremonial tricolor unfurling by Principal Dr. Rajeshwar Sen, NCC cadet march-past, patriotic dance drama, and student choir rendition of the National Anthem.',
    category: 'Culture',
    coverImage: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800&auto=format&fit=crop&q=80',
    photos: [
      { url: 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800&auto=format&fit=crop&q=80', caption: 'Tricolor National Flag unfurling at Central Courtyard' },
      { url: 'https://images.unsplash.com/photo-1569012871812-f38ee64cd54c?w=800&auto=format&fit=crop&q=80', caption: 'School assembly & cadet tricolor salute' },
      { url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80', caption: 'Patriotic thematic dance performance by junior troupe' },
      { url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80', caption: 'Inter-house march past and salute to the dais' }
    ],
    date: new Date('2026-08-15')
  },
  {
    title: 'Annual Sports Day & Athletics Tournament 2026',
    description: 'Inter-house athletic meet featuring 100m sprint finals, 4x100m relay, football tournament, badminton championship, and March Past trophy presentation.',
    category: 'Sports',
    coverImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80',
    photos: [
      { url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80', caption: 'Track sprint champion crossing the 100m finish line' },
      { url: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&auto=format&fit=crop&q=80', caption: 'Inter-house football league semi-final match' },
      { url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&auto=format&fit=crop&q=80', caption: 'Decisive tournament winning goal moment' },
      { url: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&auto=format&fit=crop&q=80', caption: 'Junior relay team baton exchange' },
      { url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&auto=format&fit=crop&q=80', caption: 'Gymnastic floor routine and fitness demonstration' }
    ],
    date: new Date('2026-09-28')
  },
  {
    title: 'Science, Innovation & AI Robotics Expo 2026',
    description: 'Student engineering models: autonomous AI rovers, smart irrigation systems, organic chemistry demonstrations, and renewable energy working prototypes.',
    category: 'Academic',
    coverImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80',
    photos: [
      { url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80', caption: 'Chemistry research laboratory titration experiment' },
      { url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80', caption: 'Student robotics sensor and obstacle detection prototype' },
      { url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80', caption: 'Artificial Intelligence humanoid robot demo' },
      { url: 'https://images.unsplash.com/photo-1508830524289-0adcbe822b40?w=800&auto=format&fit=crop&q=80', caption: 'Computer science coding lab project exhibition' }
    ],
    date: new Date('2026-07-18')
  },
  {
    title: 'Tarang Youth Cultural Fest & Auditorium Showcase',
    description: 'Vibrant stage performances: classical Kathak recitals, fusion instrumental orchestra, English Shakespearean theatre drama, and inter-school choir competition.',
    category: 'Culture',
    coverImage: 'https://images.unsplash.com/photo-1507676184212-d0330a15233c?w=800&auto=format&fit=crop&q=80',
    photos: [
      { url: 'https://images.unsplash.com/photo-1507676184212-d0330a15233c?w=800&auto=format&fit=crop&q=80', caption: 'School vocal choir and symphony ensemble' },
      { url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&auto=format&fit=crop&q=80', caption: 'Shakespearean theatrical drama on main stage' },
      { url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80', caption: 'Main auditorium sound & lighting setup' },
      { url: 'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=800&auto=format&fit=crop&q=80', caption: 'Classical Kathak and folk dance presentation' }
    ],
    date: new Date('2026-06-22')
  },
  {
    title: 'Primary Wing Kids Activity Carnival (Class I & Nursery)',
    description: 'Colourful exploratory day for Class I and Nursery students: sensory clay sculpting, storybook enactment, fun obstacle race, and water splash games.',
    category: 'General',
    coverImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80',
    photos: [
      { url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80', caption: 'Kindergarten canvas painting and color mixing' },
      { url: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&auto=format&fit=crop&q=80', caption: 'Primary classroom interactive quiz & cheerful hands' },
      { url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&auto=format&fit=crop&q=80', caption: 'Teacher guiding reading and phonetic exercises' },
      { url: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=800&auto=format&fit=crop&q=80', caption: 'Collaborative art workshop and craft models' }
    ],
    date: new Date('2026-05-12')
  },
  {
    title: 'Annual Day Celebrations & Scholastic Felicitation',
    description: 'Grand milestone event: presidential welcome address, scholastic excellence awards, Best House trophy handover, and batch valedictory speeches.',
    category: 'Annual Day',
    coverImage: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=800&auto=format&fit=crop&q=80',
    photos: [
      { url: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=800&auto=format&fit=crop&q=80', caption: 'Ceremonial lamp lighting by Principal and Chief Guest' },
      { url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80', caption: 'Academic distinction scholars felicitation' },
      { url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80', caption: 'Best House Trophy presentation ceremony' },
      { url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&auto=format&fit=crop&q=80', caption: 'Auditorium standing ovation during valedictory address' }
    ],
    date: new Date('2026-04-05')
  },
  {
    title: 'Campus Infrastructure & Digital Library Tour',
    description: 'State-of-the-art academic infrastructure: world-class CBSE library, air-conditioned smart classrooms, synthetic turf sports grounds, and dining pavilion.',
    category: 'Campus',
    coverImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80',
    photos: [
      { url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80', caption: 'Modern school central facade and landscaped grounds' },
      { url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80', caption: 'Central academic library book stacks & research section' },
      { url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800&auto=format&fit=crop&q=80', caption: 'Smart auditorium and conference seminar room' },
      { url: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&auto=format&fit=crop&q=80', caption: 'Lush green tree-lined pedestrian avenue' },
      { url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=80', caption: 'Smart interactive digital classroom with projector' }
    ],
    date: new Date('2026-02-10')
  },
  {
    title: 'Reading Marathon & Literary Club Week',
    description: 'Inter-class creative book reviews, poetry slam, author interactions, and mobile book-fair exhibition for junior and senior wings.',
    category: 'Academic',
    coverImage: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80',
    photos: [
      { url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800&auto=format&fit=crop&q=80', caption: 'Students engaged in quiet reading hour' },
      { url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80', caption: 'Library literary reference books and encyclopedias' },
      { url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&auto=format&fit=crop&q=80', caption: 'Interactive book talk and review session' }
    ],
    date: new Date('2026-01-14')
  }
];

const ensureGallerySeeded = async () => {
  const count = await GalleryAlbum.countDocuments();
  if (count < 8) {
    await GalleryAlbum.deleteMany({});
    await GalleryAlbum.insertMany(SEED_ALBUMS);
  }
};

exports.getGallery = async (req, res) => {
  try {
    await ensureGallerySeeded();
    const { category, search } = req.query;
    let query = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    const albums = await GalleryAlbum.find(query).sort({ date: -1, createdAt: -1 });
    res.json({ success: true, count: albums.length, data: albums });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createAlbum = async (req, res) => {
  try {
    const { title, description, category, coverImage, photos } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Album title is required' });
    }

    const album = await GalleryAlbum.create({
      title,
      description: description || '',
      category: category || 'General',
      coverImage: coverImage || 'https://images.unsplash.com/photo-1574629810360-7efbb6b4904c?w=800&auto=format&fit=crop&q=80',
      photos: Array.isArray(photos) ? photos : [],
      date: new Date()
    });

    res.status(201).json({ success: true, message: 'Album created successfully', data: album });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addPhotosToAlbum = async (req, res) => {
  try {
    const { photos } = req.body;
    const album = await GalleryAlbum.findById(req.params.id);
    if (!album) return res.status(404).json({ success: false, message: 'Album not found' });

    if (Array.isArray(photos)) {
      album.photos.push(...photos);
      await album.save();
    }

    res.json({ success: true, message: 'Photos added successfully', data: album });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteAlbum = async (req, res) => {
  try {
    const album = await GalleryAlbum.findByIdAndDelete(req.params.id);
    if (!album) return res.status(404).json({ success: false, message: 'Album not found' });
    res.json({ success: true, message: 'Album deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.uploadToGallery = async (req, res) => {
  try {
    const fileUrl = req.file ? `uploads/documents/${req.file.filename}` : req.body.url;
    res.json({ success: true, message: 'Media uploaded successfully to Gallery', url: fileUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
