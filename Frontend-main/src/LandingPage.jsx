
import Stat from './LandingPage/Stat';
import Feedbacks from './LandingPage/Feedbacks';
import Footer from './LandingPage/Footer';
import CTA from './LandingPage/cta';
import Page1 from './LandingPage/page1';
import Features from './LandingPage/Features';
import Chatbot from './LandingPage/chatbot';
import ManuelUtilisation from './LandingPage/ManuelUtilisation';

// Function: LandingPage.
function LandingPage() {
// Render the component JSX.
  return (
    <>
      <section id="accueil"><Page1 /></section>
      <section id="types-sejours"><Stat /></section>
      <section id="apropos"><Features /></section>
      <section id="feedbacks"><Feedbacks /></section>
      <section id="chatbot"><Chatbot /></section>
      <section id="manuel-utilisation"><ManuelUtilisation /></section>
      <section id="cta"><CTA /></section>
      <section id="contact"><Footer /></section>
    </>
  );
}

export default LandingPage;
