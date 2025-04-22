import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import serviceAccount from '../config/firebase-service-account.json';

@Injectable()
export class FirebaseService {
  private firestore: admin.firestore.Firestore;

  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      });
    }
    this.firestore = admin.firestore();
  }

  getFirestore(): admin.firestore.Firestore {
    return this.firestore;
  }

  getAuth(): admin.auth.Auth {
    return admin.auth();
  }
}