import UserReturnData from '../UserReturnData';
import StatusCodes from '../StatusCodes';
/**
 * GET route '/api/fetchMatches'
 * Allows the application to fetch the list of matches and the number of scouters for the match.
 * @param competitionID is the identifier for the competition: e.g. '2020ilch'.
 * @returns back to the client resobj (competition, list of matches, andn number of scouters) and 200 OK.
 */
module.exports = (app: any, dbHandler: any) => {
  app.get('/api/fetchMatches', async (req: any, res:any) => {
    const val: UserReturnData = new UserReturnData();
    const { competition }: Record<string, string> = req.query;
    val.data = await dbHandler.fetchMatchesForCompetition(competition).catch((e) => { console.error(e); val.err_occur = true; });
    if (val.err_occur === false) {
      res.json({
        success: true,
        competition,
        data: val.data, // TODO: Fix that structure up a bit
      });
    } else {
      res.status(StatusCodes.no_data).json({
        success: false,
        reasons: val.err_reasons,
      });
    }
  });
};
