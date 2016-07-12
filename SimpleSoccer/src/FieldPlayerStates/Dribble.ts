/**
 * @author Petr (http://www.sallyx.org/)
 */
namespace SimpleSoccer {
    export class Dribble extends State<FieldPlayer> {

        private static instance = new Dribble();

        //private Dribble() {
        //}

        //this is a singleton
        public static Instance() {
            return this.instance;
        }

        public getName() {
            return "Dribble";
        }

        //@Override
        public Enter(player: FieldPlayer) {
            //let the team know this player is controlling
            player.Team().SetControllingPlayer(player);

            //if (def(PLAYER_STATE_INFO_ON)) {
            //    debug_con.print("Player ").print(player.ID()).print(" enters dribble state").print("");
            console.log("Player " + player.ID() + " enters dribble state");
            //}
        }

        //@Override
        public Execute(player: FieldPlayer) {
            let dot = player.Team().HomeGoal().Facing().dot(player.Heading());

            //if the ball is between the player and the home goal, it needs to swivel
            // the ball around by doing multiple small kicks and turns until the player 
            //is facing in the correct direction
            if (dot < 0) {
                //the player's heading is going to be rotated by a small amount (Pi/4) 
                //and then the ball will be kicked in that direction
                let direction = player.Heading();

                //calculate the sign (+/-) of the angle between the player heading and the 
                //facing direction of the goal so that the player rotates around in the 
                //correct direction
                let angle = MathHelper.PiOver4 * -1 * player.Team().HomeGoal().Facing().Sign(player.Heading());

                Vec2DRotateAroundOrigin(direction, angle);

                //this value works well whjen the player is attempting to control the
                //ball and turn at the same time
                const KickingForce = 0.8;

                player.Ball().Kick(direction, KickingForce);
            } else { // kick the ball down the field
                player.Ball().Kick(player.Team().HomeGoal().Facing(), ParamLoader.MaxDribbleForce);
            }

            //the player has kicked the ball so he must now change state to follow it
            player.ChangeState(ChaseBall.Instance());

            return;
        }

        //@Override
        public Exit(player: FieldPlayer) {
            return;
        }

        //@Override
        public OnMessage(e: FieldPlayer, t: Telegram) {
            return false;
        }
    }
}