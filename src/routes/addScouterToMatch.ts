import { validate, Joi } from 'express-validation';
import UserReturnData from '../UserReturnData';
import Scouter from '../Scouter';
import StatusCodes from '../StatusCodes';


/**
* POST route '/api/addScouterToMatch'
* Allows the application to register a scouter as scouting a given match and team.
* @param competition is the identifier for the competition: e.g. '2020ilch'.
* @param match is the new match number.
* @param team_scouting is the team being scouted.
* @returns back to the client let resobj (success status) and HTTP Status Code 200 OK.
*/

module.exports = (app:any, dbHandler:any, auth: any) => {
  const validation = {
    body: Joi.object({
      match: Joi.string().required(),
      competition: Joi.string().required(),
      team_scouting: Joi.string().required(),
    }),
  }
  app.post('/api/addScouterToMatch', auth.noAPIKey, auth.checkAuth, validate(validation, { keyByField: true }, { allowUnknown: true }), async (req: any, res:any) => {
    let val: UserReturnData = new UserReturnData();
    const scouter: Scouter = { name: String(res.locals.name), id: String(res.locals.id), team: String(res.locals.team) };
    const { competition } = req.body;
    const match = parseInt(req.body.match, 10)
    const teamScouted: string = req.body.team_scouting
    val = await dbHandler.addScouterToMatch(req.db, scouter, match, teamScouted, competition).catch((e) => { console.error(e); val.err_occur = true; });
    if (val.err_occur === false) {
      res.locals.io.sockets.emit(`${competition}_scoutChange`, {
        name: scouter.name, match, team: teamScouted, action: 'add',
      })
      res.locals.io.sockets.emit(`${competition}_${match}_scoutChange`, {
        name: scouter.name, match, team: teamScouted, action: 'add',
      })
      res.json({
        success: true,
      });
    } else {
      res.status(StatusCodes.no_data).json({
        success: false,
        reasons: val.err_reasons,
      });
    }
  });
};
