import express from 'express';
import multer from 'multer';
import path from 'path';

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowed = ['.pptx', '.pdf'];
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Only PPTX and PDF files are supported in this MVP.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 15 * 1024 * 1024 }
});

function createMockAudit(file) {
  const name = file?.originalname || 'Untitled Deck';
  const extension = path.extname(name).toUpperCase().replace('.', '') || 'DECK';

  return {
    deckName: name,
    fileType: extension,
    generatedAt: new Date().toISOString(),
    overall: 82,
    scores: {
      clarity: 88,
      storytelling: 74,
      executiveReadiness: 79,
      visualSimplicity: 86
    },
    metrics: {
      estimatedSlides: 12,
      estimatedWords: 920,
      textDensity: 'Medium',
      riskLevel: 'Moderate'
    },
    summary: 'This deck has a strong foundation, but it needs sharper executive framing, tighter slide headlines, and reduced text density before it feels boardroom-ready.',
    strengths: [
      'The deck appears structured enough for an executive review.',
      'The core message is likely present, but it needs stronger hierarchy.',
      'The presentation has enough material to become a polished client-facing deck.'
    ],
    weaknesses: [
      'Several slides may be carrying too much text for fast executive scanning.',
      'The story arc needs a clearer beginning, middle, and recommendation.',
      'The deck may need stronger title writing to turn observations into insights.'
    ],
    fixes: [
      'Rewrite slide titles as conclusions, not labels.',
      'Reduce dense slides to one core idea and three supporting points.',
      'Add or strengthen the executive summary slide.',
      'Use more whitespace and stronger contrast to guide attention.',
      'Move operational details into appendix slides.'
    ],
    cta: {
      title: 'Want a human review?',
      description: 'Get a Johken Design professional audit with slide-by-slide recommendations within 48 hours.',
      price: '$97 Audit'
    }
  };
}

router.post('/', upload.single('deck'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Please upload a PPTX or PDF deck.' });
  }

  const audit = createMockAudit(req.file);
  res.json(audit);
});

router.get('/demo', (req, res) => {
  res.json(createMockAudit({ originalname: 'Demo Executive Deck.pptx' }));
});

export default router;
