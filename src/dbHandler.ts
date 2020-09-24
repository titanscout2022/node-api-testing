/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable import/order */

export { default as addKey } from './db-handlers/addKey';
export { default as addUserToTeam } from './db-handlers/addUserToTeam';
export { default as getUserTeam } from './db-handlers/getUserTeam';
export { default as checkKey } from './db-handlers/checkKey';
export { default as submitMatchData } from './db-handlers/submitMatchData';
export { default as submitShotChartData } from './db-handlers/submitShotChartData';

export const fetchMatchesForCompetition = async (db, competition: string): Promise<UserReturnData> => {
  const data: UserReturnData = { err_occur: false, err_reasons: [], data: { competition: undefined, data: undefined } };
  const dbo = db.db('data_scouting');
  const myobj = { competition };
  let interim = null;
  try {
    interim = await dbo.collection('matches').find(myobj).toArray().catch((e) => { data.err_occur = true; data.err_reasons.push(e); console.error(e); });
    data.data.competition = competition;
    data.data.data = [];
    for (const m of interim) {
      let numScouters = 0;
      for (let i = 0; i < 6; i += 1) {
        if (String(typeof (m.scouters[i])) !== 'boolean') {
          numScouters += 1;
        }
      }
      data.data.data[m.match - 1] = numScouters;
    }
  } catch (err) {
    data.err_occur = true;
    console.error(err);
  }
  return data;
};

export const fetchAllTeamNicknamesAtCompetition = async (db, compIdIn: string): Promise<UserReturnData> => {
  const data: UserReturnData = { err_occur: false, err_reasons: [], data: {} };
  const dbo = db.db('data_scouting');
  const myobj = { competition: String(compIdIn) };
  data.data = await dbo.collection('teamlist').findOne(myobj).catch((e) => { console.error(e); data.err_occur = true; data.err_reasons.push(e); });
  return data;
};

export const findTeamNickname = async (db, teamNumber: number) => {
  const data = { err_occur: false, err_reasons: [], data: {} };
  const dbo = db.db('data_scouting');
  const myobj = { team_num: { $exists: true } };
  await dbo.collection('teamlist').findOne(myobj).then((value: any) => {
    data.data = value[teamNumber];
  }).catch((e: string) => {
    data.err_occur = true;
    data.err_reasons.push(e);
  });
  return data;
};

export const fetchMatchData = async (db, compIdIn, matchNumberIn, teamScoutedIn): Promise<UserReturnData> => {
  const data: UserReturnData = { err_occur: false, err_reasons: [], data: {} };
  const dbo = db.db('data_scouting');
  const myobj = { competition: String(compIdIn), match: parseInt(matchNumberIn, 10), team_scouted: parseInt(teamScoutedIn, 10) };
  try {
    data.data = await dbo.collection('matchdata').findOne(myobj).catch((e) => { console.error(e); data.err_occur = true; throw new Error('Database error'); });
  } catch (err) {
    data.err_occur = true;
    data.err_reasons.push(err);
    console.error(err);
  }
  return data;
};

export const fetchCompetitionSchedule = async (db, compIdIn): Promise<UserReturnData> => {
  const data: UserReturnData = { err_occur: false, err_reasons: [], data: {} };

  const dbo = db.db('data_scouting');
  const passin = { competition: String(compIdIn) };
  try {
    data.data = await dbo.collection('matches').find(passin).toArray();
  } catch (err) {
    data.err_occur = true;
    data.err_reasons.push(err);
    console.error(err);
  }
  return data;
};

export const fetch2022Schedule = async (db, compIdIn): Promise<UserReturnData> => {
  const data: UserReturnData = { err_occur: false, err_reasons: [], data: {} };
  const dbo = db.db('data_scouting');
  const myobj = { teams: { $all: ['2022'] }, competition: String(compIdIn) };
  try {
    data.data = await dbo.collection('matches').find(myobj).toArray();
  } catch (err) {
    data.err_occur = true;
    data.err_reasons.push(err);
    console.error(err);
  }
  return data;
};

export const fetchShotChartData = async (db, competition: string, match: number, team_scouted: number): Promise<UserReturnData> => {
  const data: UserReturnData = { err_occur: false, err_reasons: [], data: {} };
  const dbo = db.db('data_scouting');
  // var myobj = {_id: compIdIn + teamScoutedIn + matchNumberIn};
  const myobj = { competition, match, team_scouted };
  try {
    data.data = await dbo.collection('shotchart').findOne(myobj).catch((e) => { console.error(e); data.err_occur = true; });
  } catch (err) {
    data.err_occur = true;
    data.err_reasons.push(err);
    console.error(err);
  }
  return data;
};
export const fetchScouterSuggestions = async (db, compIdIn, matchNumberIn): Promise<UserReturnData> => {
  const data: UserReturnData = { err_occur: false, err_reasons: [], data: {} };
  const dbo = db.db('data_scouting');
  const myobj = { competition: String(compIdIn), match: parseInt(matchNumberIn, 10) };
  try {
    const out = [];
    const toProcess = await dbo.collection('matchdata').find(myobj).toArray().catch((e) => { console.error(e); data.err_occur = true; });
    for (const scoutSub of toProcess) {
      if (scoutSub.data['strategy-notes']) {
        out.push({ scouter: scoutSub.scouter.name, strategy: scoutSub.data['strategy-notes'] });
      }
    }
    data.data = out;
  } catch (err) {
    data.err_occur = true;
    data.err_reasons.push(err);
    console.error(err);
  }
  return data;
};

export const fetchScouterUIDs = async (db, competition, matchNumberIn) => {
  const data: Record<string, any> = {
    err_occur: false, err_reasons: [], data: {}, scouters: undefined, teams: undefined,
  };
  const dbo = db.db('data_scouting');
  const myobj = { competition, match: parseInt(matchNumberIn, 10) };
  try {
    const matchdata = await dbo.collection('matches').findOne(myobj).catch((e) => { console.error(e); data.err_occur = true; });
    data.scouters = matchdata.scouters;
    data.teams = matchdata.teams;
  } catch (err) {
    data.err_occur = true;
    data.err_reasons.push(err);
    console.error(err);
  }
  return data;
};

export const addScouterToMatch = async (db, userin, namein, matchin, teamScouted) => {
  const data = { err_occur: false, err_reasons: [], data: {} };

  const dbo = db.db('data_scouting');
  const myobj = { match: parseInt(matchin, 10) };
  try {
    const interim = await dbo.collection('matches').findOne(myobj).catch((e) => { console.error(e); data.err_occur = true; });
    const index = interim.teams.indexOf(String(teamScouted));
    if (index < 0) {
      console.error('Does not exist');
      data.err_occur = true;
      data.err_reasons.push('Team does not exist in scout schedule');
    }
    interim.scouters[index] = { name: String(namein), id: String(userin) };
    await dbo.collection('matches').findOneAndReplace(myobj, interim, { upsert: true }).catch((e) => { console.error(e); data.err_occur = true; });
  } catch (err) {
    data.err_occur = true;
    data.err_reasons.push(err);
    console.error(err);
  }
  return data;
};

export const removeScouterFromMatch = async (db, userin, matchin, teamScouted) => {
  const data = { err_occur: false, err_reasons: [], data: {} };

  const dbo = db.db('data_scouting');
  const myobj = { match: parseInt(matchin, 10) };
  try {
    const interim = await dbo.collection('matches').findOne(myobj).catch((e) => { console.error(e); data.err_occur = true; });
    const index = interim.teams.indexOf(String(teamScouted));
    if (index < 0) {
      console.error('Does not exist');
      data.err_occur = true;
      data.err_reasons.push('Team does not exist in scout schedule');
    }
    interim.scouters[index] = false;
    await dbo.collection('matches').findOneAndReplace(myobj, interim, { upsert: true }).catch((e) => { console.error(e); data.err_occur = true; });
  } catch (err) {
    data.err_occur = true;
    data.err_reasons.push(err);
    console.error(err);
  }
  return data;
};

export const submitStrategy = async (db, scouterin, matchin, compin, datain) => {
  const data = { err_occur: false, err_reasons: [], data: {} };

  const dbo = db.db('strategies');
  const myobj = {
    $set: {
      scouter: scouterin, competition: compin, match: matchin, data: datain,
    },
  };
  try {
    await dbo.collection('data').updateOne({ _id: compin + scouterin + matchin }, myobj, { upsert: true });
  } catch (err) {
    data.err_occur = true;
    data.err_reasons.push(err);
    console.error(err);
  }
  return data;
};

export const fetchStrategy = async (db, compIdIn, matchIdIn) => {
  const data = { err_occur: false, err_reasons: [], data: {} };

  const dbo = db.db('strategies');
  const myobj = { competition: String(compIdIn), match: String(matchIdIn) };
  try {
    data.data = await dbo.collection('data').find(myobj).toArray();
  } catch (err) {
    data.err_occur = true;
    data.err_reasons.push(err);
    console.error(err);
  }
  return data;
};

export const fetchUserStrategy = async (db, compIdIn, matchIdIn, namein) => {
  const data = { err_occur: false, err_reasons: [], data: {} };

  const dbo = db.db('strategies');
  const myobj = { competition: String(compIdIn), match: String(matchIdIn), scouter: String(namein) };
  try {
    data.data = await dbo.collection('data').find(myobj).toArray();
  } catch (err) {
    data.err_occur = true;
    data.err_reasons.push(err);
    console.error(err);
  }
  return data;
};

export const submitPitData = async (db, scouterin, competitionin, matchin, teamin, datain) => {
  const data = { err_occur: false, err_reasons: [], data: {} };

  const dbo = db.db('data_scouting');
  const myobj = {
    $set: {
      scouter: scouterin, competition: competitionin, match: matchin, team_scouted: teamin, data: datain,
    },
  };
  try {
    await dbo.collection('pitdata').updateOne({ _id: competitionin + matchin + teamin }, myobj, { upsert: true }).catch((e) => { console.error(e); data.err_occur = true; });
  } catch (err) {
    data.err_occur = true;
    data.err_reasons.push(err);
    console.error(err);
  }
  return data;
};

export const fetchPitData = async (db, compIdIn, matchNumberIn, teamScoutedIn) => {
  const data = { err_occur: false, err_reasons: [], data: {} };

  const dbo = db.db('data_scouting');
  // var myobj = {_id: compIdIn + teamScoutedIn + matchNumberIn};
  const myobj = { competition: String(compIdIn), match: parseInt(matchNumberIn, 10), team_scouted: parseInt(teamScoutedIn, 10) };
  try {
    data.data = await dbo.collection('pitdata').findOne(myobj).catch((e) => { console.error(e); data.err_occur = true; });
  } catch (err) {
    data.err_occur = true;
    data.err_reasons.push(err);
    console.error(err);
  }
  return data;
};
// export const getCompetitions = async (db, idin) => {
//     let rval;
//     idin = String(idin)
//     // Get the competitions for a team member. Currently, one user can only be part of one team.
//     var dbo = db.db("data_scouting");
//     var myobj = { id: idin};
//     var data = await dbo.collection("userlist").findOne(myobj)
//     return rval
// }

// const globalCompetition = '2020ilch';
