import Scouter from '../Scouter';
import UserReturnData from '../UserReturnData';

export default async (db: any, competition: string, match: number, scouter: Scouter): Promise<UserReturnData> => {
  const data: UserReturnData = {
    err_occur: false, err_reasons: [], data: {}, scouters: [], teams: [],
  };
  const dbo = db.db('data_scouting');
  const myobj = { competition, match, owner: scouter.team };
  try {
    let matchdata = await dbo.collection('matches').findOne(myobj).catch((e) => { console.error(e); data.err_occur = true; });
    if (matchdata === null) matchdata = {};
    data.data.scouters = matchdata.scouters;
    data.data.teams = matchdata.teams;
  } catch (err) {
    data.err_occur = true;
    data.err_reasons.push(err.toString());
  }
  return data;
};
