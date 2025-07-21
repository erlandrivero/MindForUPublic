import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IAppointment extends Document {
  caller: string;
  assistant?: string;
  intent?: string;
  details?: any;
  createdAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>({
  caller: { type: String, required: true },
  assistant: { type: String },
  intent: { type: String },
  details: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
});

const AppointmentModel = models.Appointment || model<IAppointment>('Appointment', AppointmentSchema);

export async function getAppointmentsForUser(phoneNumber: string, date: string) {
  // Find appointments for the given caller (phoneNumber) and date (YYYY-MM-DD)
  const start = new Date(date);
  const end = new Date(date);
  end.setDate(end.getDate() + 1);
  return AppointmentModel.find({
    caller: phoneNumber,
    createdAt: { $gte: start, $lt: end }
  });
}

export default AppointmentModel;
