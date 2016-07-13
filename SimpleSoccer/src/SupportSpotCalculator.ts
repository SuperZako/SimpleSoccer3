
/// <reference path="./common/Time/Regulator.ts" />

/**
 *  Desc:   Class to determine the best spots for a suppoting soccer
 *          player to move to.
 * 
 * @author Petr (http://www.sallyx.org/)
 */
namespace SimpleSoccer {
    //a data structure to hold the values and positions of each spot
    class SupportSpot {
        constructor(public position: Vector2, public score: number) {
        }
    }

    export class SupportSpotCalculator {
        private spots: SupportSpot[] = [];
        //a pointer to the highest valued spot from the last update
        private bestSupportingSpot: SupportSpot = null;
        //this will regulate how often the spots are calculated (default is
        //one update per second)
        private regulator = new Regulator(ParamLoader.SupportSpotUpdateFreq);

        //------------------------------- ctor ----------------------------------------
        constructor(numX: number, numY: number, private team: SoccerTeam) {
            let PlayingField = team.Pitch().PlayingArea();

            //calculate the positions of each sweet spot, create them and 
            //store them in m_Spots
            let HeightOfSSRegion = PlayingField.Height() * 0.8;
            let WidthOfSSRegion = PlayingField.Width() * 0.9;
            let SliceX = WidthOfSSRegion / numX;
            let SliceY = HeightOfSSRegion / numY;

            let left = PlayingField.Left() + (PlayingField.Width() - WidthOfSSRegion) / 2.0 + SliceX / 2.0;
            let right = PlayingField.Right() - (PlayingField.Width() - WidthOfSSRegion) / 2.0 - SliceX / 2.0;
            let top = PlayingField.Top() + (PlayingField.Height() - HeightOfSSRegion) / 2.0 + SliceY / 2.0;

            for (let x = 0; x < (numX / 2) - 1; ++x) {
                for (let y = 0; y < numY; ++y) {
                    if (team.isBlue()) {
                        this.spots.push(new SupportSpot(new Vector2(left + x * SliceX, top + y * SliceY), 0.0));
                    } else {
                        this.spots.push(new SupportSpot(new Vector2(right - x * SliceX, top + y * SliceY), 0.0));
                    }
                }
            }

            //create the regulator
            //this.m_pRegulator = new Regulator(ParamLoader.SupportSpotUpdateFreq);
        }

        ////------------------------------- dtor ----------------------------------------
        ////-----------------------------------------------------------------------------
        //    @Override
        //    protected void finalize() throws Throwable {
        //        super.finalize();
        //        m_pRegulator = null;
        //    }

        //    /**
        //     * draws the spots to the screen as a hollow circles. The higher the 
        //     * score, the bigger the circle. The best supporting spot is drawn in
        //     * bright green.
        //     */
        public Render(ctx: CanvasRenderingContext2D) {
            //        gdi.HollowBrush();
            //        gdi.GreyPen();
            ctx.fillStyle = "gray";
            for (let spot of this.spots) {
                //            gdi.Circle(m_Spots.get(spt).m_vPos, m_Spots.get(spt).m_dScore);
                ctx.beginPath();
                //ctx.fillStyle = 'rgb(0, 0, 0)'; // black
                ctx.arc(spot.position.x, spot.position.y, spot.score, 0, Math.PI * 2, false);
                ctx.fill();
            }

            //        if (m_pBestSupportingSpot != null) {
            //            gdi.GreenPen();
            //            gdi.Circle(m_pBestSupportingSpot.m_vPos, m_pBestSupportingSpot.m_dScore);
            //        }
        }

        /**
         * this method iterates through each possible spot and calculates its
         * score.
         */
        public DetermineBestSupportingPosition() {
            //only update the spots every few frames                              
            if (!this.regulator.isReady() && this.bestSupportingSpot !== null) {
                return this.bestSupportingSpot.position;
            }

            //reset the best supporting spot
            this.bestSupportingSpot = null;

            let BestScoreSoFar = 0.0;

            for (let spot of this.spots) {
                //SupportSpot curSpot = it.next();
                //first remove any previous score. (the score is set to one so that
                //the viewer can see the positions of all the spots if he has the 
                //aids turned on)
                spot.score = 1.0;

                //Test 1. is it possible to make a safe pass from the ball's position 
                //to this position?
                if (this.team.isPassSafeFromAllOpponents(this.team.ControllingPlayer().Pos(),
                    spot.position,
                    null,
                    ParamLoader.MaxPassingForce)) {
                    spot.score += ParamLoader.Spot_PassSafeScore;
                }


                //Test 2. Determine if a goal can be scored from this position.  
                if (this.team.CanShoot(spot.position, ParamLoader.MaxShootingForce)) {
                    spot.score += ParamLoader.Spot_CanScoreFromPositionScore;
                }


                //Test 3. calculate how far this spot is away from the controlling
                //player. The further away, the higher the score. Any distances further
                //away than OptimalDistance pixels do not receive a score.
                if (this.team.SupportingPlayer() !== null) { //TODO: nema tu byt m_pTeam.ControllingPlayer()??

                    const OptimalDistance = 200.0;

                    let dist = Vec2DDistance(this.team.ControllingPlayer().Pos(), spot.position);

                    let temp = Math.abs(OptimalDistance - dist);

                    if (temp < OptimalDistance) {

                        //normalize the distance and add it to the score
                        spot.score += ParamLoader.Spot_DistFromControllingPlayerScore * (OptimalDistance - temp) / OptimalDistance;
                    }
                }

                //check to see if this spot has the highest score so far
                if (spot.score > BestScoreSoFar) {
                    BestScoreSoFar = spot.score;

                    this.bestSupportingSpot = spot;
                }

            }

            return this.bestSupportingSpot.position;
        }

        /**
         * returns the best supporting spot if there is one. If one hasn't been
         * calculated yet, this method calls DetermineBestSupportingPosition and
         * returns the result.
         */
        public GetBestSupportingSpot() {
            if (this.bestSupportingSpot !== null) {
                return this.bestSupportingSpot.position;
            } else {
                return this.DetermineBestSupportingPosition();
            }
        }
    }
}