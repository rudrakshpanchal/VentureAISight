'use client';

import { initializeApp, getApp, getApps } from 'firebase/app';

const firebaseConfig = {
  "projectId": "studio-3568256536-fd917",
  "appId": "1:39761510329:web:d6ce7863efb39d79268068",
  "apiKey": "AIzaSyD_rYHQj2Hyc-LQBI6iq2_FtCLiZk7Ghbc",
  "authDomain": "studio-3568256536-fd917.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "39761510329"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export { app };
