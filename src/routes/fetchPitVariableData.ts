import { validate, Joi } from 'express-validation';
import UserReturnData from '../UserReturnData';
import StatusCodes from '../StatusCodes';


/**
* GET route '/api/fetchPitVariableData'
* Gets the data from all teams for a given competiton and variable name.
* @param competition is the competition ID (ex: 2020ilch).
* @returns back to the client let resobj (success status) and HTTP Status Code 200 OK.
*/

module.exports = (app: any, dbHandler: any) => {
  const validation = {
    query: Joi.object({
      competition: Joi.string().required(),
    }),
  }
  app.get('/api/fetchPitVariableData', validate(validation, { keyByField: true }, { allowUnknown: true }), async (req: any, res:any) => {
    const val: UserReturnData = new UserReturnData();
    const { competition }: Record<string, string> = req.query;
    let dataInterim;
    val.data = await dbHandler.fetchPitVariableData(req.db, competition).catch((e) => { console.error(e); val.err_occur = true; val.err_reasons.push(e); });
    // the try...catch is the next few lines serves to ensure the application doesn't just crash if scouters or teams were not returned by the DB handler.
    try {
      dataInterim = val.data.data;
    } catch (e) {
      val.err_occur = true;
    }
    if (val.err_occur === false) {
      res.json({
        success: true,
        competition,
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
