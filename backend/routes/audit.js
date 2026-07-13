import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

import { parsePresentation }
from '../src/parsers/pptParser.js';

import {
  MAX_FILE_SIZE_BYTES,
  MAX_FILE_SIZE_MB,
  MAX_SLIDES,
  MIN_TEXT_CHARS
} from '../utils/constants.js';

import {
  auditPipeline
} from '../services/auditPipeline.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: 'uploads/',

  filename: (req, file, cb) => {
    const safeName =
      file.originalname.replace(
        /[^a-zA-Z0-9._-]/g,
        '-'
      );

    cb(
      null,
      `${Date.now()}-${safeName}`
    );
  }
});

const fileFilter = (req, file, cb) => {
  const ext =
    path.extname(
      file.originalname
    ).toLowerCase();

  const allowed = [
    '.pptx',
    '.pdf'
  ];

  if (allowed.includes(ext)) {
    cb(null, true);
    return;
  }

  cb(
    new Error(
      'Only PPTX and PDF files are supported in this V1 audit.'
    )
  );
};

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize:
      MAX_FILE_SIZE_BYTES
  }
});

function handleUploadError(
  error,
  req,
  res,
  next
) {
  if (
    error instanceof multer.MulterError &&
    error.code === 'LIMIT_FILE_SIZE'
  ) {
    return res.status(413).json({
      error:
        `This V1 audit supports files up to ${MAX_FILE_SIZE_MB}MB. ` +
        'Please upload a smaller deck or request a Professional Deck Audit.'
    });
  }

  if (error) {
    return res.status(400).json({
      error:
        error.message ||
        'Upload failed. Please try a PPTX or PDF file.'
    });
  }

  next();
}

async function safelyDeleteUpload(filePath) {
  if (!filePath) {
    return;
  }

  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.warn(
      'Unable to remove temporary upload:',
      error.message
    );
  }
}

router.post(
  '/',

  (req, res, next) => {
    upload.single('deck')(
      req,
      res,
      error =>
        handleUploadError(
          error,
          req,
          res,
          next
        )
    );
  },

  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        error:
          'Please upload a PPTX or PDF deck.'
      });
    }

    const ext =
      path.extname(
        req.file.originalname
      ).toLowerCase();

    try {
      let slides = [];

      if (ext === '.pptx') {
        slides =
          await parsePresentation(
            req.file.path
          );
      }

      /*
       * PDF parsing is not implemented yet.
       * This temporary fallback keeps PDF uploads
       * from crashing the application.
       */
      if (
        ext === '.pdf' &&
        !slides.length
      ) {
        slides = [
          {
            number: 1,
            title:
              req.file.originalname,
            text:
              'PDF text extraction will be added in the PDF parser sprint.'
          }
        ];
      }

      if (!slides.length) {
        return res.status(422).json({
          error:
            'No readable slide text was found in this presentation.'
        });
      }

      if (
        slides.length >
        MAX_SLIDES
      ) {
        return res.status(413).json({
          error:
            `This V1 audit supports decks up to ${MAX_SLIDES} slides. ` +
            `Your file contains ${slides.length} slides. ` +
            'Split the presentation into a smaller section or request a Professional Deck Audit.'
        });
      }

      /*
       * Keep using auditPipeline here.
       *
       * The pipeline returns the full response shape
       * currently expected by the frontend:
       *
       * - overall
       * - grade
       * - readiness
       * - dna
       * - priorityQueue
       * - healthReport
       * - slides
       */
      const result =
        auditPipeline({
          slides,

          deckName:
            req.file.originalname,

          fileType:
            ext
              .replace('.', '')
              .toUpperCase(),

          fileSize:
            `${(
              req.file.size /
              (1024 * 1024)
            ).toFixed(1)} MB`,

          source: 'upload'
        });

      return res.json(result);
    } catch (error) {
      console.error(
        'Presentation audit failed:',
        error
      );

      return res.status(500).json({
        error:
          error.message ||
          'Unable to analyze this presentation.'
      });
    } finally {
      await safelyDeleteUpload(
        req.file.path
      );
    }
  }
);

router.post(
  '/text',
  (req, res) => {
    const {
      title =
        'Pasted Slide Copy',

      text = ''
    } = req.body || {};

    if (
      !text.trim() ||
      text.trim().length <
        MIN_TEXT_CHARS
    ) {
      return res.status(400).json({
        error:
          'Please paste at least one complete sentence or a few slide bullets.'
      });
    }

    const result =
      auditPipeline({
        slides: [
          {
            number: 1,
            title,
            text
          }
        ],

        deckName: title,
        fileType: 'TEXT',
        fileSize:
          'Not applicable',
        source: 'text'
      });

    return res.json(result);
  }
);

router.get(
  '/demo',
  (req, res) => {
    const slides = [
      {
        number: 1,
        title:
          'Q3 Revenue Update',

        text:
          'Q3 revenue increased 18% year over year. ' +
          'Enterprise renewals drove 62% of growth, but churn rose to 7%.'
      },

      {
        number: 2,
        title:
          'Customer Onboarding Risk',

        text:
          'Customer interviews show onboarding delays are the main constraint. ' +
          'The team should prioritize onboarding automation before expanding the outbound sales campaign.'
      },

      {
        number: 3,
        title:
          'Recommended Next Step',

        text:
          'We recommend approving a 30-day onboarding automation sprint ' +
          'with one product owner, one customer success lead, and a Q4 adoption milestone.'
      }
    ];

    const result =
      auditPipeline({
        slides,

        deckName:
          'Demo Executive Deck.pptx',

        fileType: 'PPTX',
        fileSize: '1.2 MB',
        source: 'demo'
      });

    return res.json(result);
  }
);

export default router;