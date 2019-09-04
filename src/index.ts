import * as minimist from 'minimist';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import moment from 'moment';

const argv = minimist.default(process.argv.slice(2));

const keyfile = argv.keyfile;
if (!keyfile) {
  console.error('No key file specified.');
  process.exit();
}

const serviceAccount = JSON.parse(fs.readFileSync(keyfile).toString());
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const firestore = admin.firestore();

async function test() {
  const payload = {
    nowStr: moment().format(),
    plainJsDate: new Date(),
    momentToDate: moment().toDate(),
    utcStartOfDate: moment()
      .utc()
      .startOf('date')
      .toDate(),
    utcStartOfDay: moment()
      .utc()
      .startOf('day')
      .toDate(),
    sartOfDay: moment()
      .startOf('day')
      .toDate(),
    utc: moment()
      .utc()
      .toDate(),
    unix: moment().unix(),
  };

  await createInFiretore('test_date', payload.nowStr, payload);
  console.log(`Created Firestore Object:${payload.nowStr}`);

  const snap = await getFromFirestore('test_date', payload.nowStr);
  const testDate = snap.data();
  const keys = Object.keys(testDate);
  console.log('To Date:');
  keys.forEach((key: string) => {
    if (key === 'nowStr') {
      console.log(`${key}:Date as string :${testDate[key]}}`);
    } else if (key === 'unix') {
      console.log(`${key}:timestamp :${testDate[key]}}`);
    } else {
      console.log(
        `${key}:Raw :${JSON.stringify(testDate[key])} toDate() :${moment(
          testDate[key].toDate()
        ).format()}`
      );
    }
  });
  console.log('Using UNIX timestamp:');
  keys.forEach((key: string) => {
    if (key === 'nowStr') {
      console.log(`${key}:Date as string :${testDate[key]}}`);
    } else if (key === 'unix') {
      console.log(`${key}:timestamp :${testDate[key]}}`);
    } else {
      console.log(
        `${key}:Raw :${JSON.stringify(testDate[key])} unix :${moment
          .unix(testDate[key]._seconds)
          .format()}`
      );
    }
  });
  console.log('Using UNIX timestamp with UTC:');
  keys.forEach((key: string) => {
    if (key === 'nowStr') {
      console.log(`${key}:Date as string :${testDate[key]}}`);
    } else if (key === 'unix') {
      console.log(`${key}:timestampo :${testDate[key]}}`);
    } else {
      console.log(
        `${key}:Raw :${JSON.stringify(testDate[key])} unix :${moment
          .unix(testDate[key]._seconds)
          .utc()
          .format()}`
      );
    }
  });
}

function createInFiretore(collection: string, id: string, payload: any) {
  const docRef = firestore.collection(collection).doc(id);
  return docRef.set(payload, { merge: true });
}

function getFromFirestore(collection: string, id: string) {
  return firestore
    .collection(collection)
    .doc(id)
    .get();
}

test();
