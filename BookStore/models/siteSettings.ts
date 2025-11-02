import mongoose, { Document, Schema } from 'mongoose';

export interface ISiteSettings extends Document {
  logo?: string;
  title: string;
  metaDescription: string;
  metaKeywords: string;
  apiKey?: string;
  maintenanceMode: boolean;
}

const siteSettingsSchema = new Schema<ISiteSettings>({
  logo: { type: String },
  title: { type: String, required: true },
  metaDescription: { type: String, required: true },
  metaKeywords: { type: String, required: true },
  apiKey: { type: String, default: "Not set" },
  maintenanceMode: { type: Boolean, default: false }
}, { timestamps: true });

export const SiteSettingsModel = mongoose.models.SiteSettings || mongoose.model<ISiteSettings>('SiteSettings', siteSettingsSchema);