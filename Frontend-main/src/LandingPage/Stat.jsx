import { useEffect, useMemo, useRef, useState } from "react";
import { IoMdPeople, IoIosDocument } from "react-icons/io";
import { SlCalender } from "react-icons/sl";
import { GiProgression, GiRibbonMedal } from "react-icons/gi";
import { HiAcademicCap } from "react-icons/hi2";
import { authFetch, getApiBaseUrl } from "../api/jwtClient";
import "./Stat.css";

function useCountUp(target, duration = 2000, isVisible) {
  const [count, setCount] = useState(0);
  const hasAnimated = useRef(false);
  const safeTarget = Number.isFinite(Number(target)) ? Number(target) : 0;

  useEffect(() => {
    if (!isVisible) return;
    if (hasAnimated.current) {
      requestAnimationFrame(() => setCount(safeTarget));
      return;
    }
    hasAnimated.current = true;

    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(eased * safeTarget));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [isVisible, safeTarget, duration]);

  return count;
}

const defaultStats = [
  { icon: <IoMdPeople size={24} />, value: 0, prefix: "+", suffix: "", label: "CHERCHEURS" },
  { icon: <SlCalender size={22} />, value: 12, prefix: "", suffix: "", label: "ANNÉES D'EXPÉRIENCE" },
  { icon: <IoIosDocument size={22} />, value: 0, prefix: "", suffix: "", label: "DEMANDES" },
  { icon: <GiProgression size={22} />, value: 100, prefix: "", suffix: "%", label: "TRAÇABILITÉ" },
];

const fetchJson = async (path) => {
  const url = `${getApiBaseUrl()}${path}`;
  let response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    response = await authFetch(path, { method: "GET" });
  }

  if (!response.ok) {
    throw new Error(`API ${path} returned ${response.status}`);
  }

  return response.json();
};

function StatItem({ icon, value, prefix, suffix, label, isVisible, delay }) {
  const count = useCountUp(value, 2000, isVisible);

  return (
    <div
      className={`stat-item ${isVisible ? "stat-item--visible" : ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="stat-icon">{icon}</div>
      <div className="stat-number">
        {prefix}{count}{suffix}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function Stat() {
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    nbChercheurs: 0,
    nbDemandes: 0,
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadStats = async () => {
      try {
        const landingStats = await fetchJson("/dashboard/landing/");
        const dashboardData = landingStats?.data ?? landingStats;
        const nbChercheurs = dashboardData?.total_chercheurs;
        const nbDemandes = dashboardData?.total_demandes;

        if (isMounted) {
          setDashboardStats({
            nbChercheurs: Number.isFinite(Number(nbChercheurs)) ? Number(nbChercheurs) : 0,
            nbDemandes: Number.isFinite(Number(nbDemandes)) ? Number(nbDemandes) : 0,
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques de la landing page:", error);
      }
    };

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(
    () =>
      defaultStats.map((stat, index) => {
        if (index === 0) {
          return { ...stat, value: dashboardStats.nbChercheurs };
        }
        if (index === 2) {
          return { ...stat, value: dashboardStats.nbDemandes };
        }
        return stat;
      }),
    [dashboardStats]
  );

  return (
    <section id="statistic" ref={sectionRef}>
      <div className="stats-row">
        <div className="stats-wrapper">
          {stats.map((stat, i) => (
            <div key={stat.label} className="stat-group">
              <StatItem {...stat} isVisible={isVisible} delay={i * 150} />
              {i < stats.length - 1 && <div className="stat-divider" />}
            </div>
          ))}
        </div>
      </div>

      <div className="types-section">
        <div className="types-container">
          <div className="types-heading">
            <h4 className="types-subtitle">NOS PROGRAMMES</h4>
            <p className="types-title">Découvrez les séjours disponibles</p>
            <div className="types-underline" />
          </div>

          <div className="cards-grid">
            <div className="card card--navy">
              <div className="card-logo card-logo--navy">
                <HiAcademicCap size={22} />
              </div>
              <h2 className="card-title">Stage de Perfectionnement</h2>
              <p className="card-description">
                Enseignants chercheurs inscrits en doctorat (à partir de la 2ème
                inscription) • Étudiants non salariés en doctorat (2ème à 5ème
                inscription)
              </p>
              <div className="card-duration">
                15 à 30 jours (jusqu'à 6 mois pour cotutelle)
              </div>
              <hr className="card-divider" />
            </div>

            <div className="card card--gold">
              <div className="card-logo card-logo--gold">
                <GiRibbonMedal size={22} />
              </div>
              <h2 className="card-title">Séjours Scientifiques de Haut Niveau</h2>
              <p className="card-description">
                Professeurs et MCF classe A (7 jours) • MCF classe B pour
                préparation habilitation (7-15 jours, max 4 séjours)
              </p>
              <div className="card-duration">7 à 15 jours</div>
              <hr className="card-divider" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Stat;
