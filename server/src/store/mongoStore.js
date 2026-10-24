import mongoose from 'mongoose';
import { loadSeed } from '../data/loadSeed.js';

const schema = new mongoose.Schema(
  {
    title: String,
    summary: String,
    category: String,
    source: String,
    url: String,
    views: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    publishedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const toArticle = ({ _id, ...rest }) => ({
  id: String(_id),
  ...rest,
  publishedAt: new Date(rest.publishedAt).toISOString(),
});

export async function createMongoStore(uri) {
  await mongoose.connect(uri);
  const Article = mongoose.models.Article || mongoose.model('Article', schema);

  if ((await Article.countDocuments()) === 0) {
    await Article.insertMany(loadSeed().map(({ id, ...story }) => story));
  }

  const validId = (id) => mongoose.isValidObjectId(id);

  return {
    getAll: async () => (await Article.find().lean()).map(toArticle),
    getById: async (id) => {
      if (!validId(id)) return null;
      const doc = await Article.findById(id).lean();
      return doc ? toArticle(doc) : null;
    },
    create: async (data) => toArticle((await Article.create(data)).toObject()),
    incrementViews: async (id) => {
      if (!validId(id)) return null;
      const doc = await Article.findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true }).lean();
      return doc ? toArticle(doc) : null;
    },
  };
}
