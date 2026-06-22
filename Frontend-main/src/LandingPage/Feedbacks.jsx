import './Feedback.css'
import Feedbaack from './Feedback';
import { getLandingFeedbacks } from './Data';

// Function: Feedbacks.
function Feedbacks(){
    const feedbacks = getLandingFeedbacks();
// Render the component JSX.
    return(
        <section id="fedbacks">
            <div className="container">
                <div className="feedback-heading">
                    <h3>TÉMOIGNAGES</h3>
                    <h1>Ce que disent nos chercheurs</h1>
                    <div className='underlined-line'></div>
                </div>

                <div className="feeds">
                {feedbacks.length === 0 ? (
                 <p style={{ textAlign: 'center', color: '#6b7280' }}>
                     Aucun témoignage pour le moment.
                 </p>
                ) : (
                feedbacks.map((feedback) => {
                const {id, name, grade, univ, star, message} = feedback;
// Render the component JSX.
                return (
                <Feedbaack key={id} name={name} grade={grade} univ={univ} star={star} message={message} />
             );
  })
)}
                </div>

            </div>

        </section>



    )
}


export default Feedbacks ; 
