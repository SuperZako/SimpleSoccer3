/**
 *  Desc:   Class to determine the best spots for a suppoting soccer
 *          player to move to.
 * 
 * @author Petr (http://www.sallyx.org/)
 */
//package SimpleSoccer;

//import common.D2.Vector2D;
//import static common.D2.Vector2D.Vec2DDistance;
//import common.Game.Region;
//import common.Time.Regulator;
//import static common.misc.Cgdi.gdi;
//import static SimpleSoccer.ParamLoader.Prm;
//import static java.lang.Math.abs;
//import java.util.ArrayList;
//import java.util.List;
//import java.util.ListIterator;

namespace SimpleSoccer {
    //a data structure to hold the values and positions of each spot
    class SupportSpot {

        public m_vPos: Vector2D;
        public m_dScore: number;

        constructor(pos: Vector2D, value: number) {
            this.m_vPos = new Vector2D(pos.x, pos.y);
            this.m_dScore = value;
        }
    }

    //------------------------------------------------------------------------
    export class SupportSpotCalculator {


        private m_pTeam: SoccerTeam;
        private m_Spots = <SupportSpot[]>[]; // new ArrayList<SupportSpot>();
        //a pointer to the highest valued spot from the last update
        private m_pBestSupportingSpot: SupportSpot;
        //this will regulate how often the spots are calculated (default is
        //one update per second)
        private m_pRegulator: Regulator;

        //------------------------------- ctor ----------------------------------------
         constructor(numX: number, numY: number, team: SoccerTeam) {
            this.m_pBestSupportingSpot = null;
            this.m_pTeam = team;
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
                    if (this.m_pTeam.Color() === SoccerTeam.blue) {
                        this.m_Spots.push(new SupportSpot(new Vector2D(left + x * SliceX, top + y * SliceY), 0.0));
                    } else {
                        this.m_Spots.push(new SupportSpot(new Vector2D(right - x * SliceX, top + y * SliceY), 0.0));
                    }
                }
            }

            //create the regulator
            this.m_pRegulator = new Regulator(ParamLoader.SupportSpotUpdateFreq);
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
        //    public void Render() {
        //        gdi.HollowBrush();
        //        gdi.GreyPen();

        //        for (int spt = 0; spt < m_Spots.size(); ++spt) {
        //            gdi.Circle(m_Spots.get(spt).m_vPos, m_Spots.get(spt).m_dScore);
        //        }

        //        if (m_pBestSupportingSpot != null) {
        //            gdi.GreenPen();
        //            gdi.Circle(m_pBestSupportingSpot.m_vPos, m_pBestSupportingSpot.m_dScore);
        //        }
        //    }

        /**
         * this method iterates through each possible spot and calculates its
         * score.
         */
        public DetermineBestSupportingPosition() {
            //only update the spots every few frames                              
            if (!this.m_pRegulator.isReady() && this.m_pBestSupportingSpot != null) {
                return this.m_pBestSupportingSpot.m_vPos;
            }

            //reset the best supporting spot
            this.m_pBestSupportingSpot = null;

            let BestScoreSoFar = 0.0;

            //ListIterator < SupportSpot > it = m_Spots.listIterator();
            //while (it.hasNext()) {
            for (let it of this.m_Spots) {
                //SupportSpot curSpot = it.next();
                //first remove any previous score. (the score is set to one so that
                //the viewer can see the positions of all the spots if he has the 
                //aids turned on)
                it.m_dScore = 1.0;

                //Test 1. is it possible to make a safe pass from the ball's position 
                //to this position?
                if (this.m_pTeam.isPassSafeFromAllOpponents(this.m_pTeam.ControllingPlayer().Pos(),
                    it.m_vPos,
                    null,
                    ParamLoader.MaxPassingForce)) {
                    it.m_dScore += ParamLoader.Spot_PassSafeScore;
                }


                //Test 2. Determine if a goal can be scored from this position.  
                if (this.m_pTeam.CanShoot(it.m_vPos, ParamLoader.MaxShootingForce)) {
                    it.m_dScore += ParamLoader.Spot_CanScoreFromPositionScore;
                }


                //Test 3. calculate how far this spot is away from the controlling
                //player. The further away, the higher the score. Any distances further
                //away than OptimalDistance pixels do not receive a score.
                if (this.m_pTeam.SupportingPlayer() != null) { //TODO: nema tu byt m_pTeam.ControllingPlayer()??

                    const OptimalDistance = 200.0;

                    let dist = Vec2DDistance(this.m_pTeam.ControllingPlayer().Pos(), it.m_vPos);

                    let temp = Math.abs(OptimalDistance - dist);

                    if (temp < OptimalDistance) {

                        //normalize the distance and add it to the score
                        it.m_dScore += ParamLoader.Spot_DistFromControllingPlayerScore * (OptimalDistance - temp) / OptimalDistance;
                    }
                }

                //check to see if this spot has the highest score so far
                if (it.m_dScore > BestScoreSoFar) {
                    BestScoreSoFar = it.m_dScore;

                    this.m_pBestSupportingSpot = it;
                }

            }

            return this.m_pBestSupportingSpot.m_vPos;
        }

        /**
         * returns the best supporting spot if there is one. If one hasn't been
         * calculated yet, this method calls DetermineBestSupportingPosition and
         * returns the result.
         */
        public GetBestSupportingSpot() {
            if (this.m_pBestSupportingSpot != null) {
                return this.m_pBestSupportingSpot.m_vPos;
            } else {
                return this.DetermineBestSupportingPosition();
            }
        }
    }
}