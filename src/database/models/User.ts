import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  accountId: string;
  email: string;
  username: string;
  timesinceLastUpdate: Date;
  password: string;
  emailVerified: boolean;
  banned: boolean;
  accountToken: string;
  friends: {
    incoming: {
      type: any;
      defaults: [];
    };
    outgoing: {
      type: any;
      default: [];
    };
    accepted: {
      type: any;
      default: [];
    };
    blocked: {
      type: any;
      default: [];
    };
  };
}

interface Friends {
  incoming: any;
  outgoing: any;
  accepted: any;
  blocked: any;
}

const UserSchema = new Schema<IUser>({
  accountId: { type: String, required: true },
  email: { type: String, required: true },
  username: { type: String, required: true },
  timesinceLastUpdate: { type: Date, required: true },
  password: { type: String, required: true },
  emailVerified: { type: Boolean, default: false },
  banned: { type: Boolean, default: false },
  accountToken: { type: String, required: true },
  friends: {
    incoming: {
      type: Array,
      default: [],
    },
    outgoing: {
      type: Array,
      default: [],
    },
    accepted: {
      type: Array,
      default: [],
    },
    blocked: {
      type: Array,
      default: [],
    },
  },
});

export default model<IUser>("User", UserSchema);
