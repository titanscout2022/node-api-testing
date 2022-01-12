import { validate, Joi } from 'express-validation';
import UserReturnData from '../UserReturnData';
import StatusCodes from '../StatusCodes';
import Scouter from '../Scouter';

module.exports = (app: any, dbHandler: any, auth: any) => {
  const validation = {
    body: Joi.object({
      team_scouting: Joi.string().required(),
      match: Joi.string().required(),
      competition: Joi.string().required(),
    }),
  }
  app.post('/api/removeScouterFromMatch', auth.checkAuth, validate(validation, { keyByField: true }, { allowUnknown: true }), async (req: any, res:any) => {
    let val: UserReturnData = new UserReturnData();
    const scouter: Scouter = { name: String(res.locals.name), id: String(res.locals.id), team: String(res.locals.team) };
    const match = parseInt(req.body.match, 10);
    const teamScouted: string = req.body.team_scouting;
    const { competition } = req.body
    val = await dbHandler.removeScouterFromMatch(req.db, match, teamScouted, competition, scouter).catch((e) => { console.error(e); val.err_occur = true; });

    if (val.err_occur === false) {
      res.locals.io.sockets.emit(`${competition}_scoutChange`, {
        match, team: teamScouted, action: 'remove', owner: scouter.team,
      })
      res.locals.io.sockets.emit(`${competition}_${match}_scoutChange`, {
        match, team: teamScouted, action: 'remove', owner: scouter.team,
      })
      res.locals.io.sockets.emit(`${scouter.team}_${competition}_${match}_scoutChange`, {
        match, team: teamScouted, action: 'remove', owner: scouter.team, perfomedBy: scouter.name
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
