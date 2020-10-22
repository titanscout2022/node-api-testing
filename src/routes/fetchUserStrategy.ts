import UserReturnData from '../UserReturnData';
import StatusCodes from '../StatusCodes';

module.exports = (app:any, dbHandler:any, auth: any) => {
  app.get('/api/fetchUserStrategy', auth.checkAuth, async (req: any, res:any) => {
    const val: UserReturnData = new UserReturnData();
    const { competition, matchNumber }: Record<string, string> = req.query;
    const { name }: Record<string, string> = res.locals;
    let dataInterim: Array<any>;
    if (!(competition && matchNumber)) {
      val.err_occur = true;
      val.err_reasons.push('A required parameter (competition ID or match number) was not provided')
    } else {
      val.data = await dbHandler.fetchUserStrategy(req.db, competition, matchNumber, name).catch((e) => { console.error(e); val.err_occur = true; });
      // the try...catch is the next few lines serves to ensure the application doesn't just crash if scouters or teams were not returned by the DB handler.

      try {
        dataInterim = val.data.data;
      } catch (e) {
        val.err_occur = true;
      }
    }

    if (val.err_occur === false) {
      res.json({
        success: true,
        data: dataInterim,
      });
    } else {
      res.status(StatusCodes.no_data).json({
        success: false,
        reasons: val.err_reasons,
      });
    }
  });
};
