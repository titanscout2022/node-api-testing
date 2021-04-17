import UserReturnData from '../UserReturnData';

export default async (db: any, flag: string, data: Record<string, any>, team: string): Promise<UserReturnData> => {
  const dataReturn: UserReturnData = { err_occur: false, err_reasons: [], data: {} };
  const dbo = db.db('data_processing');
  const myobj = {
    $set: {},
  };

  myobj.$set[flag] = data;

  try {
    await dbo.collection('flags').updateOne({ _id: team }, myobj, { upsert: true });
  } catch (err) {
    dataReturn.err_occur = true;
    dataReturn.err_reasons.push(err);
    console.error(err);
  }
  return dataReturn;
};
