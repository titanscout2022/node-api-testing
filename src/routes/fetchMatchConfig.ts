import UserReturnData from '../UserReturnData';
import StatusCodes from './StatusCodes';
import fetchMatchConfig from '../db-handlers/fetchMatchConfig';

module.exports = (app: any) => {
  app.get('/api/fetchMatchConfig', async (req: any, res:any) => {
    const val: UserReturnData = new UserReturnData();
    const competition = String(req.query.competition);
    const team: number = parseInt(req.query.team, 10);
    if (!(competition && team)) {
      val.err_occur = true;
      val.err_reasons.push('A required parameter (competition ID or team number) was not provided');
    }
    val.data = await fetchMatchConfig(req.db, competition, team).catch((e) => { console.error(e); val.err_occur = true; });
    // the try...catch is the next few lines serves to ensure the application doesn't just crash if scouters or teams were not returned by the DB handler.
    let dataInterim: Record<string, unknown>;
    try {
      dataInterim = val.data.data.config;
    } catch (e) {
      val.err_occur = true;
    }
    if (val.err_occur === false) {
      res.json({
        success: true,
        competition,
        team,
        config: dataInterim,
      });
    } else {
      res.status(StatusCodes.no_data).json({
        success: false,
        reasons: val.err_reasons,
      });
    }
  });
};
