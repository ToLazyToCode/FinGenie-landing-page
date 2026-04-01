import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import Testimonials from "./components/Testimonials";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import SideNav from "./components/SideNav";
import AuthModal from "./components/AuthModal";
import UserPortalPanel from "./components/UserPortalPanel";
import { ADMIN_PORTAL_URL } from "./config/appConfig";
import { fingenieApi } from "./lib/fingenieApi";
import { clearAuthSession, loadAuthSession, saveAuthSession } from "./portal/authStore";

const sectionThemes = ["dark", "mid", "light", "mid", "dark"];
const sectionCount = 5;

let lastScrollTime = 0;

export default function App() {
  const containerRef = useRef(null);
  const isAnimating = useRef(false);

  const [current, setCurrent] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authDefaultMode, setAuthDefaultMode] = useState("user");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [session, setSession] = useState(() => loadAuthSession());
  const [portalOpen, setPortalOpen] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [entitlements, setEntitlements] = useState(null);
  const [plans, setPlans] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [publicReviews, setPublicReviews] = useState([]);
  const [checkoutLoadingPlanCode, setCheckoutLoadingPlanCode] = useState(null);
  const [savingReview, setSavingReview] = useState(false);

  const isUserSession = session?.role === "USER" && Boolean(session?.token);

  const goTo = useCallback(
    (index) => {
      if (index < 0 || index >= sectionCount) {
        return;
      }
      if (isAnimating.current || index === current) {
        return;
      }
      isAnimating.current = true;

      gsap.to(containerRef.current, {
        y: `-${index * 100}vh`,
        duration: 1,
        ease: "power3.inOut",
        onComplete: () => {
          setCurrent(index);
          isAnimating.current = false;
        },
      });
    },
    [current]
  );

  const clearPortalData = () => {
    setProfile(null);
    setEntitlements(null);
    setPlans([]);
    setMyReview(null);
  };

  const loadPortalData = useCallback(async (token) => {
    if (!token) {
      return;
    }
    setPortalLoading(true);
    setAuthError("");
    try {
      const [profilePayload, entitlementsPayload, plansPayload, reviewPayload] = await Promise.all([
        fingenieApi.getProfileComplete(token),
        fingenieApi.getEntitlements(token),
        fingenieApi.getPlans(token),
        fingenieApi.getMyReview(token),
      ]);

      setProfile(profilePayload);
      setEntitlements(entitlementsPayload);
      setPlans(Array.isArray(plansPayload) ? plansPayload : []);
      setMyReview(reviewPayload || null);
    } catch (error) {
      setAuthError(error.message || "Unable to load account data.");
    } finally {
      setPortalLoading(false);
    }
  }, []);

  const openUserAuth = useCallback(() => {
    setAuthDefaultMode("user");
    setAuthError("");
    setAuthModalOpen(true);
  }, []);

  const openAdminAuth = useCallback(() => {
    setAuthDefaultMode("admin");
    setAuthError("");
    setAuthModalOpen(true);
  }, []);

  const handleUserLogin = async ({ email, password }) => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const payload = await fingenieApi.loginUser({ email, password });
      const nextSession = {
        role: "USER",
        token: payload.accessToken,
        accountId: payload.accountId,
        email: payload.email,
        fullName: payload.fullName,
      };

      setSession(nextSession);
      saveAuthSession(nextSession);
      setAuthModalOpen(false);
      setPortalOpen(true);
      await loadPortalData(nextSession.token);
    } catch (error) {
      setAuthError(error.message || "Login failed.");
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAdminLogin = async ({ email, password }) => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const payload = await fingenieApi.loginAdmin({ email, password });
      const redirectUrl = new URL(ADMIN_PORTAL_URL, window.location.origin);
      redirectUrl.searchParams.set("adminToken", payload.accessToken);
      redirectUrl.searchParams.set("adminId", String(payload.adminId || ""));
      redirectUrl.searchParams.set("adminEmail", payload.email || email);
      redirectUrl.searchParams.set("adminName", payload.name || "Admin");
      redirectUrl.searchParams.set("adminRole", payload.role || "ADMIN");
      window.location.assign(redirectUrl.toString());
    } catch (error) {
      setAuthError(error.message || "Admin login failed.");
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const handleUserLogout = () => {
    clearAuthSession();
    setSession(null);
    clearPortalData();
    setPortalOpen(false);
  };

  const handleCheckoutStart = async (planCode) => {
    if (!isUserSession) {
      openUserAuth();
      return;
    }

    setCheckoutLoadingPlanCode(planCode);
    try {
      const payload = await fingenieApi.createCheckout({ token: session.token, planCode });
      if (payload?.checkoutUrl) {
        window.open(payload.checkoutUrl, "_blank", "noopener,noreferrer");
      }
    } catch (error) {
      setAuthError(error.message || "Unable to start checkout.");
    } finally {
      setCheckoutLoadingPlanCode(null);
    }
  };

  const handleSaveReview = async ({ rating, title, comment, hasExistingReview }) => {
    if (!isUserSession) {
      return;
    }
    setSavingReview(true);
    try {
      const payload = hasExistingReview
        ? await fingenieApi.updateMyReview({
            token: session.token,
            rating,
            title: title || null,
            comment,
          })
        : await fingenieApi.createMyReview({
            token: session.token,
            rating,
            title: title || null,
            comment,
          });

      setMyReview(payload);
      await loadPortalData(session.token);
    } catch (error) {
      setAuthError(error.message || "Unable to save review.");
    } finally {
      setSavingReview(false);
    }
  };

  useEffect(() => {
    if (authModalOpen || portalOpen) {
      return undefined;
    }

    const onWheel = (event) => {
      const now = Date.now();
      if (now - lastScrollTime < 900) {
        return;
      }
      lastScrollTime = now;

      event.preventDefault();
      if (isAnimating.current) {
        return;
      }

      if (event.deltaY > 0 && current < sectionCount - 1) {
        goTo(current + 1);
      } else if (event.deltaY < 0 && current > 0) {
        goTo(current - 1);
      }
    };

    const onKeyDown = (event) => {
      if (isAnimating.current) {
        return;
      }

      if ((event.key === "ArrowDown" || event.key === "PageDown") && current < sectionCount - 1) {
        event.preventDefault();
        goTo(current + 1);
      } else if ((event.key === "ArrowUp" || event.key === "PageUp") && current > 0) {
        event.preventDefault();
        goTo(current - 1);
      } else if (event.key === "Home") {
        event.preventDefault();
        goTo(0);
      } else if (event.key === "End") {
        event.preventDefault();
        goTo(sectionCount - 1);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [current, goTo, authModalOpen, portalOpen]);

  useEffect(() => {
    let mounted = true;
    fingenieApi
      .getPublicReviews(9)
      .then((payload) => {
        if (!mounted) {
          return;
        }
        setPublicReviews(Array.isArray(payload) ? payload : []);
      })
      .catch(() => {
        if (!mounted) {
          return;
        }
        setPublicReviews([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isUserSession) {
      clearPortalData();
      return;
    }
    void loadPortalData(session.token);
  }, [isUserSession, session?.token, loadPortalData]);

  const sections = useMemo(
    () => [
      <Hero
        key="hero"
        active={current === 0}
        isAuthenticated={isUserSession}
        onPrimaryAction={() => {
          if (isUserSession) {
            setPortalOpen(true);
            return;
          }
          openUserAuth();
        }}
        onSecondaryAction={() => goTo(2)}
      />,
      <Features key="features" active={current === 1} />,
      <HowItWorks key="how" active={current === 2} />,
      <Testimonials key="testimonials" active={current === 3} reviews={publicReviews} />,
      <>
        <CTA
          key="cta"
          active={current === 4}
          isAuthenticated={isUserSession}
          onPrimaryAction={() => {
            if (isUserSession) {
              setPortalOpen(true);
              return;
            }
            openUserAuth();
          }}
          onSecondaryAction={() => goTo(1)}
        />
        <Footer key="footer" />
      </>,
    ],
    [current, isUserSession, publicReviews, goTo, openUserAuth]
  );

  return (
    <>
      <header className="landing-topbar">
        <div className="landing-brand">
          <span className="gradient-text">Fin</span>Genie
        </div>
        <div className="landing-top-actions">
          {isUserSession ? (
            <>
              <button className="btn btn-secondary" type="button" onClick={() => setPortalOpen(true)}>
                Open Portal
              </button>
              <button className="btn btn-secondary" type="button" onClick={handleUserLogout}>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary" type="button" onClick={openUserAuth}>
                User Sign In
              </button>
              <button className="btn btn-secondary" type="button" onClick={openAdminAuth}>
                Admin Entry
              </button>
            </>
          )}
        </div>
      </header>

      <div className="container" ref={containerRef}>
        {sections.map((section, index) => (
          <section
            key={index}
            className={`section ${sectionThemes[index]} ${index === sectionCount - 1 ? "section-last" : ""}`}
          >
            {section}
          </section>
        ))}
      </div>

      <div style={{ height: `${sectionCount * 100}vh` }} />

      <SideNav current={current} total={sectionCount} goTo={goTo} />

      <AuthModal
        open={authModalOpen}
        defaultMode={authDefaultMode}
        loading={authLoading}
        error={authError}
        onClose={() => setAuthModalOpen(false)}
        onUserLogin={handleUserLogin}
        onAdminLogin={handleAdminLogin}
      />

      <UserPortalPanel
        open={portalOpen && isUserSession}
        loading={portalLoading}
        profile={profile}
        entitlements={entitlements}
        plans={plans}
        review={myReview}
        checkoutLoadingPlanCode={checkoutLoadingPlanCode}
        savingReview={savingReview}
        onClose={() => setPortalOpen(false)}
        onRefresh={() => loadPortalData(session?.token)}
        onStartCheckout={handleCheckoutStart}
        onSaveReview={handleSaveReview}
        onLogout={handleUserLogout}
      />
    </>
  );
}
