import mongoose from "mongoose";

const normalizeMongoUri = (uri) => {
  const trimmed = String(uri || "").trim();
  if (!trimmed) {
    return "";
  }

  return trimmed.replace(/\/$/, "");
};

const ensureDatabaseName = (uri, databaseName = "Ekart-YT") => {
  const normalizedUri = normalizeMongoUri(uri);
  if (!normalizedUri) {
    return "";
  }

  const hasDatabaseName = /mongodb(?:\+srv)?:\/\/.+\/[^/?]+(?:\?|$)/.test(
    normalizedUri,
  );

  if (hasDatabaseName) {
    return normalizedUri;
  }

  return `${normalizedUri}/${databaseName}`;
};

const getCandidateUris = () => {
  const primaryUri = ensureDatabaseName(
    process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGO_URL,
  );
  const fallbackUri = ensureDatabaseName(
    process.env.MONGO_FALLBACK_URI || "mongodb://127.0.0.1:27017/Ekart-YT",
  );

  return [...new Set([primaryUri, fallbackUri].filter(Boolean))];
};

const connectDB = async () => {
  const candidateUris = getCandidateUris();
  const connectionErrors = [];

  for (const connectionString of candidateUris) {
    try {
      await mongoose.connect(connectionString, {
        serverSelectionTimeoutMS: 10000,
      });

      console.log(`Database connected successfully: ${connectionString}`);
      return;
    } catch (error) {
      connectionErrors.push({ connectionString, error });
      console.error(
        `Error connecting to the database (${connectionString}):`,
        error,
      );
    }
  }

  const errorMessages = connectionErrors
    .map(
      ({ connectionString, error }) =>
        `${connectionString} -> ${error?.message || error}`,
    )
    .join(" | ");

  throw new Error(
    `Unable to connect to MongoDB using any configured URI. ${errorMessages}`,
  );
};

export default connectDB;
