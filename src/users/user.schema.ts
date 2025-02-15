import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, UpdateQuery } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  username: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: 'default-avatar.png' })
  avatar?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type UserDocument = HydratedDocument<User> & {
  createdAt: Date;
  updatedAt: Date;
};

UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err as Error);
  }
});

UserSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate() as UpdateQuery<UserDocument>;

  if (update?.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(update.password, salt);
      this.setUpdate(update);
      next();
    } catch (err) {
      next(err as Error);
    }
  } else {
    next();
  }
});
