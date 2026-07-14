import mongoose from 'mongoose'

const predictionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    imagePath: String,
    prediction: String,
    confidence: Number,
    inferenceTimeMs: Number,
    probabilities: [
      {
        mineral: String,
        value: Number
      }
    ]
  },
  { timestamps: true }
)

export default mongoose.model('Prediction', predictionSchema)
