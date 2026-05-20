import LoadingScreen from "./components/LoadingScreen";
import Footer from "./components/Footer";
import ResultCard from "./components/ResultCard";
import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { FaHeart, FaBars, FaTimes } from "react-icons/fa";
import { GoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("All");
  const [courseFilter, setCourseFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");
  const [patternFilter, setPatternFilter] = useState("All");
  const [sortOption, setSortOption] = useState("latest");
  const [subscriptionMessage, setSubscriptionMessage] = useState("");
  const [subscriptions, setSubscriptions] = useState([]);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth || 1200);
  const [messageType, setMessageType] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [notificationModal, setNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [savedModal, setSavedModal] = useState(false);
  const [dashboardModal, setDashboardModal] = useState(false);
  const [closingModal, setClosingModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 10;
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [savedResults, setSavedResults] = useState([]);

  useEffect(() => {
  fetch(`${API_URL}/api/results`)
    .then((res) => res.json())
    .then((data) => {
      setResults(data);
      setLoading(false);
    })
    .catch((error) => {
      console.error(error);
      setLoading(false);
    });
}, [API_URL]);
useEffect(() => {

  fetchNotifications();

  if (!user) return;

  fetchFavorites();
  fetchSubscriptions();

}, [user]);
useEffect(() => {

  if (subscriptionMessage) {

    const timer = setTimeout(() => {

      setSubscriptionMessage("");

    }, 2000);

    return () =>
      clearTimeout(timer);
  }

}, [subscriptionMessage]);

useEffect(() => {

  const storedUser =
    localStorage.getItem("user");

  if (storedUser) {

    setUser(
      JSON.parse(storedUser)
    );
  }

}, []);
useEffect(() => {

  const handleResize = () => {
    if (typeof window !== "undefined")
    setScreenWidth(window.innerWidth);

  };

  window.addEventListener(
    "resize",
    handleResize
  );

  return () =>
    window.removeEventListener(
      "resize",
      handleResize
    );

}, []);

const fetchSubscriptions =
  async () => {
    try {
      const response =
        await axios.get(
          `${API_URL}/api/subscriptions?email=${user.email}`
        );

      setSubscriptions(
        response.data
      );
    } catch (error) {
      console.log(error);
    }
  };
const fetchNotifications = async () => {
  try {

    const response = await fetch(
      `${API_URL}/api/notifications`
    );

    const data = await response.json();

    setNotifications(data);

  } catch (error) {

    console.log(error);

  }
};
  const subscribeToResults =
  async (course, semester) => {
    try {
      const response =
        await axios.post(
          `${API_URL}/api/subscriptions`,
          {
            userEmail: user.email,
            course,
            semester,
          }
        );

      setSubscriptions((prev) => [
        ...prev,
        response.data.subscription,
      ]);

      
      setSubscriptionMessage(
        `Subscribed to ${course} Semester ${semester}`
      );
      setMessageType("success");
      toast.success(`Subscribed to ${course} Semester ${semester}`);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };
  const removeSubscription =
  async (id) => {
    const previousSubscriptions = subscriptions;
    try {
      setSubscriptions((prev) =>
        prev.filter(
          (sub) => sub._id !== id
        )
      );
      
      await axios.delete(
        `${API_URL}/api/subscriptions?id=${id}`
      );

      setSubscriptionMessage(
        "Subscription removed"
      );

      setMessageType("success");
      toast.success("Subscription removed");
    } catch (error) {
      setSubscriptions(previousSubscriptions);
      console.log(error);
    }
  };
const handleConfirmAction = async () => {

  if (
    confirmModal.type === "favorite"
  ) {

    const result =
  confirmModal.result;

setSavedResults((prev) =>
  prev.filter(
    (item) =>
      item._id !== result._id
  )
);

try {

  await fetch(
    `${API_URL}/api/favorites?id=${result._id}`,
    {
      method: "DELETE",
    }
  );

  toast.success("Result removed");

} catch (error) {

  console.log(error);

  toast.error(
    "Failed to remove result"
  );
}
  }

  if (
    confirmModal.type === "subscription"
  ) {

    await removeSubscription(
      confirmModal.id
    );
  }

  setConfirmModal(null);
};
const fetchFavorites = async () => {
  try {
    const response = await fetch(
  `${API_URL}/api/favorites?email=${user?.email}`
    );

    const data = await response.json();

    setSavedResults(data);
  } catch (error) {
    console.log("Error fetching favorites:", error);
  }
};

const saveFavorite = async (result) => {
  if (!user) {
    toast.error("Please login first to save results.");
    return;
  }

  const alreadySaved = savedResults.find(
    (item) => item.pdfUrl === result.pdfUrl
  );

  if (alreadySaved) {

    setSavedResults((prev) =>
      prev.filter(
        (item) => item.pdfUrl !== result.pdfUrl
      )
    );

    try {
      await fetch(
        `${API_URL}/api/favorites?id=${alreadySaved._id}`,
        {
          method: "DELETE",
        }
      );

      toast.success("Result removed");

    } catch (error) {
      console.log(error);
      toast.error("Failed to remove result");
    }

  } else {

    setSavedResults((prev) => [
      ...prev,
      result,
    ]);

    try {

      const response = await fetch(
        `${API_URL}/api/favorites`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...result,
            userEmail: user?.email,
          }),
        }
      );

      const data = await response.json();

      setSavedResults((prev) =>
        prev.map((item) =>
          item.pdfUrl === result.pdfUrl
            ? data.favorite
            : item
        )
      );

      toast.success("Result saved");

    } catch (error) {
      console.log(error);
      toast.error("Failed to save result");
    }
  }
};
const closeDashboard = () => {

  setClosingModal(true);

  setTimeout(() => {

    setDashboardModal(false);

    setClosingModal(false);

  }, 250);
};
const closeNotificationsModal = () => {

  setClosingModal(true);

  setTimeout(() => {

    setNotificationModal(false);

    setClosingModal(false);

  }, 250);
};

const closeSavedModal = () => {

  setClosingModal(true);

  setTimeout(() => {

    setSavedModal(false);

    setClosingModal(false);

  }, 250);
};

const normalizeText = (text = "") => {
  return text
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[()\-]/g, "")
    .trim();
};

const filteredResults = results

  .filter((result) => {
const normalizedTitle = normalizeText(result.title);
    const normalizedSearch = normalizeText(search);

    const searchWords = normalizedSearch.split(" ");
    const matchesCourse =
  courseFilter === "All" ||
  result.title.includes(courseFilter);
  const matchesYear =
  yearFilter === "All" ||
  result.date.includes(yearFilter);
  const matchesPattern =
  patternFilter === "All" ||
  result.title.includes(patternFilter);
  const matchesSemester =
  semesterFilter === "All" ||
  new RegExp(`Semester\\s-\\s${semesterFilter}(\\)|\\s)`).test(result.title || "");
  const matchesSearch = searchWords.every((word) =>
  normalizedTitle.includes(word)
);

return matchesSearch &&
       matchesSemester &&
       matchesCourse &&
       matchesYear &&
       matchesPattern;
  })
  .filter((result) => {

  if (sortOption !== "recent") {
    return true;
  }

  const cleanDate =
    result.date?.trim() || "";

  const parts =
    cleanDate.split("/");

  if (parts.length !== 3) {
    return false;
  }

  const resultDate = new Date(
    parts[2],
    parts[1] - 1,
    parts[0]
  );

  const today = new Date();

  return (
    resultDate.toDateString() ===
    today.toDateString()
  );
})

.sort((a, b) => {

  const dateA = new Date(
    a.date.split("/").reverse().join("-")
  );

  const dateB = new Date(
    b.date.split("/").reverse().join("-")
  );

  if (sortOption === "latest") {
    return dateB - dateA;
  }

  if (sortOption === "oldest") {
    return dateA - dateB;
  }

  return 0;
});
const totalPages = Math.max(
  1,
  Math.ceil(filteredResults.length / resultsPerPage)
);

const startIndex = (currentPage - 1) * resultsPerPage;

const paginatedResults = filteredResults.slice(
  startIndex,
  startIndex + resultsPerPage
);
if (loading) {
  return <LoadingScreen />;
}
const courses = [
  "All",
  ...new Set(
    results.map((result) => {
      const match = result.title.match(/^(.+?)\s\(/);
      return match ? match[1] : "Other";
    })
  ),
];
const patterns = [
  "All",
  ...new Set(
    results.flatMap((result) => {
      const matches = result.title.match(
        /\((CBCGS|CBCS|NEP 2020|REV|ATKT)\)/gi
      );

      return matches
        ? matches.map((match) => match.replace(/[()]/g, ""))
        : [];
    })
  ),
];
const menuButtonStyle = {
  backgroundColor: "#1e293b",
  color: "white",
  border: "1px solid #334155",
  padding: "14px",
  borderRadius: "10px",
  textAlign: "left",
  cursor: "pointer",
  fontSize: "16px",
};
const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 4000,
};

const modalStyle = {
  backgroundColor: "#0f172a",
  padding: "30px",
  borderRadius: "16px",
  width: "90%",
  maxWidth: "400px",
  border: "1px solid #334155",
  textAlign: "center",
};
const resetFilters = () => {

  setSearch("");

  setSemesterFilter("All");

  setCourseFilter("All");

  setYearFilter("All");

  setPatternFilter("All");

  setSortOption("latest");

  setCurrentPage(1);
};
const trackedResults =
  subscriptions.map((sub) => {

    const matchedResult =
      results.find((result) => {

        const matchesCourse =
          result.title.includes(
            sub.course
          );

        const matchesSemester =
          result.title.includes(
            `Semester - ${sub.semester}`
          );

        return (
          matchesCourse &&
          matchesSemester
        );
      });

    return {
      ...sub,
      published:
        !!matchedResult,
      result: matchedResult,
    };
  });
const publishedResults =
  trackedResults.filter(
    (item) => item.published
  );

const monitoringResults =
  trackedResults.filter(
    (item) => !item.published
  );
  const publishedCount =
  publishedResults.length;

const monitoringCount =
  monitoringResults.length;

const subscriptionCount =
  subscriptions.length;

const savedCount =
  savedResults.length;

const recentResults = results.filter(
  (result) => {

    const today = new Date();

    const parts = result.date.split("/");

    if (parts.length !== 3) {
      return false;
    }

    const resultDate = new Date(
      parts[2],
      parts[1] - 1,
      parts[0]
    );

    return (
      resultDate.toDateString() ===
      today.toDateString()
    );
  }
);
  return (
  <>
    <style>
      {`
        @keyframes modalFade {
          from {
            opacity: 0;
            transform: scale(0.85);
          }

          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      @keyframes modalFadeOut {
      from {
      opacity: 1;
      transform: scale(1);
      }
      
      to {
      opacity: 0;
      transform: scale(0.96);
      }
      }
      `}
    </style>

    <div
      style={{
        padding: "20px",
        backgroundColor: "#0f172a",
        minHeight: "100vh",
        color: "white",
      }}
    >
      {confirmModal && (
  <div style={overlayStyle}>

    <div style={modalStyle}>
      
      <h2
  style={{
    marginBottom: "10px",
    fontSize: "28px",
  }}
>
        {confirmModal.type === "favorite"
          ? "Remove saved result?"
          : "Stop monitoring result?"}
      </h2>

      <div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "18px",
    marginTop: "28px",
  }}
>
  <button
    onClick={() =>
      setConfirmModal(null)
    }
    style={{
      padding: "10px 22px",
      borderRadius: "10px",
      border: "1px solid #475569",
      backgroundColor: "#1e293b",
      color: "white",
      cursor: "pointer",
      fontSize: "15px",
      transition: "0.2s ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform =
        "translateY(-2px)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform =
        "translateY(0px)";
    }}
  >
    Cancel
  </button>

  <button
    onClick={handleConfirmAction}
    style={{
      padding: "10px 22px",
      borderRadius: "10px",
      border: "none",
      backgroundColor: "#dc2626",
      color: "white",
      cursor: "pointer",
      fontSize: "15px",
      transition: "0.2s ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform =
        "translateY(-2px)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform =
        "translateY(0px)";
    }}
  >
    Confirm
  </button>
</div>

    </div>

  </div>
)}
      {notificationModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 3000,
      animation: closingModal
  ? "modalFadeOut 0.3s ease forwards"
  : "modalFade 0.4s ease",
    }}
  >
    <div
      style={{
        backgroundColor: "#0f172a",
        padding: "30px",
        borderRadius: "16px",
        width: "400px",
        border: "1px solid #334155",
        boxShadow: "0 0 25px rgba(37,99,235,0.3)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ color: "white", margin: 0 }}>
          Notifications
        </h2>

        <button
          onClick={closeNotificationsModal}
          style={{
            background: "none",
            border: "none",
            color: "white",
            fontSize: "22px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>
      {user ? (
  <p>
    <strong>{user.name}'s</strong>
  </p>
  
) : (
  <p>Please login first to manage notifications</p>
)}
{subscriptions.length > 0 && (
  <div
    style={{
      marginTop: "10px",
    }}
  >
    <h3>
      Active Subscriptions
    </h3>

    {subscriptions.map((sub) => (
      <div
        key={sub._id}
        style={{
          backgroundColor: "#111827",
          padding: "12px",
          borderRadius: "10px",
          marginTop: "20px",
          marginBottom: "10px",
          border: "1px solid #334155",
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
        }}
      >
        <span>
          {sub.course} - Semester{" "}
          {sub.semester}
        </span>

        <button
          onClick={() =>
            setConfirmModal({
              type: "subscription",
              id: sub._id,
            })
          }
          style={{
            backgroundColor:
              "#a21c1c",
            color: "white",
            border: "none",
            padding:
              "8px 12px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Unsubscribe
        </button>
      </div>
    ))}
  </div>
)}
    </div>
  </div>
)}
{dashboardModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor:
        "rgba(0,0,0,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 3000,
      animation: closingModal
  ? "modalFadeOut 0.3s ease forwards"
  : "modalFade 0.4s ease",
    }}
  >
    <div
      style={{
        backgroundColor: "#0f172a",
        padding: "30px",
        borderRadius:
        screenWidth < 768
        ? "0px"
        : "16px",
        width: 
        screenWidth < 768
        ? "100%"
        : "90%",
        maxWidth: "900px",
        maxHeight: "90vh",
        padding: screenWidth < 768 ? "16px" : "30px",
        overflowY: "auto",
        border:
          "1px solid #334155",
        
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <h2
          style={{
            margin: 0,
          }}
        >
          Student Dashboard
        </h2>

        <button
          onClick={closeDashboard}
          style={{
            background: "none",
            border: "none",
            color: "white",
            fontSize: "22px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      {user ? (
        <>
        <div
  style={{
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "20px",
    marginBottom: "35px",
  }}
>
  {[
    {
      value: savedCount,
      label: "Saved Results",
    },
    {
      value: subscriptionCount,
      label: "Subscriptions",
    },
    {
      value: publishedCount,
      label: "Published Results",
    },
    {
      value: monitoringCount,
      label: "Monitoring",
    },
  ].map((card, index) => (
    <div
      key={index}
      style={{
        flex: "1 1 180px",
        maxWidth: "220px",
        minWidth:
        screenWidth < 768
        ? "140px" 
        : "180px",
        backgroundColor: "#111827",
        padding:
        screenWidth < 768 
        ? "14px" 
        : "18px",
        borderRadius: "16px",
        border: "1px solid #334155",
        textAlign: "center",
        transition: "0.25s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform =
          "translateY(-4px)";

        e.currentTarget.style.boxShadow =
          "0 10px 30px rgba(59,130,246,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform =
          "translateY(0px)";

        e.currentTarget.style.boxShadow =
          "none";
      }}
    >
      <h2
        style={{
          marginBottom: "10px",
          fontSize: "clamp(28px, 5vw, 40px)",
        }}
      >
        {card.value}
      </h2>

      <p
        style={{
          color: "#e2e8f0",
          fontSize: "clamp(15px, 2vw, 18px)",
        }}
      >
        {card.label}
      </p>
    </div>
  ))}
</div>
          <div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  }}
>
  {trackedResults.length === 0 ? (
  <p>
    No active subscriptions yet.
  </p>
) : (
  <>
    {publishedResults.length >
  0 && (
  <div
    style={{
      marginBottom: "30px",
    }}
  >
    <h2
      style={{
        color: "#22c55e",
        marginBottom: "15px",
      }}
    >
      Published Results
    </h2>

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {publishedResults.map(
        (item) => (
          <div
            key={item._id}
            style={{
              backgroundColor:
                "#111827",
              padding: "20px",
              borderRadius:
                "14px",
              border:
                "1px solid #334155",
            }}
          >
            <h3>
              {item.course} -
              Semester{" "}
              {
                item.semester
              }
            </h3>

            <p
              style={{
                color:
                  "#22c55e",
                fontWeight:
                  "bold",
              }}
            >
              Result Published
            </p>

            <a
              href={
                item.result
                  ?.pdfUrl
              }
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display:
                  "inline-block",
                marginTop:
                  "10px",
                padding:
                  "10px 16px",
                backgroundColor:
                  "#00319c",
                color:
                  "white",
                textDecoration:
                  "none",
                borderRadius:
                  "8px",
              }}
            >
              View PDF
            </a>
          </div>
        )
      )}
    </div>
  </div>
)}
{monitoringResults.length >
  0 && (
  <div>
    <h2
      style={{
        color: "#facc15",
        marginBottom: "15px",
      }}
    >
      Monitoring Results
    </h2>

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {monitoringResults.map(
        (item) => (
          <div
            key={item._id}
            style={{
              backgroundColor:
                "#111827",
              padding: "20px",
              borderRadius:
                "14px",
              border:
                "1px solid #334155",
            }}
          >
            <h3>
              {item.course} -
              Semester{" "}
              {
                item.semester
              }
            </h3>

            <p
              style={{
                color:
                  "#facc15",
                fontWeight:
                  "bold",
              }}
            >
              Monitoring for
              result...
            </p>

            <p
              style={{
                color:
                  "#94a3b8",
                fontSize:
                  "14px",
                marginTop:
                  "8px",
              }}
            >
              Last checked:
              just now
            </p>
          </div>
        )
      )}
    </div>
  </div>
)}
  </>
)}
</div>
{notifications.length > 0 && (
  <div
    style={{
      backgroundColor: "#111827",
      padding: "20px",
      borderRadius: "14px",
      border: "1px solid #334155",
      marginBottom: "20px",
    }}
  >
    <h3
      style={{
        marginBottom: "18px",
      }}
    >
      Recent Alerts
    </h3>

    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "15px",
      }}
    >
      {notifications.slice(0, 5).map((notification) => (
        <div
          key={notification._id}
          style={{
            backgroundColor: "#0f172a",
            padding: "15px",
            borderRadius: "10px",
            border: "1px solid #334155",
          }}
        >
          <h4
            style={{
              marginBottom: "8px",
              color: "#e2e8f0",
            }}
          >
            {notification.title}
          </h4>

          <p
            style={{
              color: "#94a3b8",
              fontSize: "14px",
              marginBottom: "12px",
            }}
          >
            Published on {notification.date}
          </p>

          <a
            href={notification.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "8px 14px",
              backgroundColor: "#00319c",
              color: "white",
              textDecoration: "none",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          >
            View PDF
          </a>
        </div>
      ))}
    </div>
  </div>
)}
          {savedResults.length >
            0 && (
            <div
              style={{
                backgroundColor:
                  "#111827",
                padding: "20px",
                borderRadius:
                  "14px",
                border:
                  "1px solid #334155",
              }}
            >
              <h3
                style={{
                  marginBottom:
                    "15px",
                }}
              >
                Latest Saved Result
              </h3>

              <p>
                {
                  savedResults[
                    savedResults.length -
                      1
                  ]?.title
                }
              </p>
            </div>
          )}
        </>
      ) : (
        <p>
          Please login first
        </p>
      )}
    </div>
  </div>
)}
{savedModal && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0,0,0,0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 3000,
      animation: closingModal
  ? "modalFadeOut 0.3s ease forwards"
  : "modalFade 0.4s ease",
    }}
  >
    <div
      style={{
        backgroundColor: "#0f172a",
        padding: "30px",
        borderRadius: "16px",
        width: "90%",
        maxWidth: "700px",
        maxHeight: "80vh",
        overflowY: "auto",
        border: "1px solid #334155",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "25px",
        }}
      >
        <h2 style={{ margin: 0 }}>
          Saved Results
        </h2>

        <button
          onClick={closeSavedModal}
          style={{
            background: "none",
            border: "none",
            color: "white",
            fontSize: "22px",
            cursor: "pointer",
          }}
        >
          ✕
        </button>
      </div>

      {savedResults.length === 0 ? (
        <p style={{ color: "#94a3b8" }}>
          No saved results yet.
        </p>
      ) : (
        savedResults.map((result, index) => (
          <div
            key={index}
            style={{
              backgroundColor: "#111827",
              padding: "18px",
              borderRadius: "12px",
              marginBottom: "15px",
              border: "1px solid #334155",
            }}
          >
            <h3
              style={{
                fontSize: "18px",
                marginBottom: "10px",
              }}
            >
              {result.title}
            </h3>

            <p
              style={{
                color: "#94a3b8",
                marginBottom: "12px",
              }}
            >
              {result.date}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <a
                href={result.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "8px 14px",
                  backgroundColor: "#00319c",
                  borderRadius: "8px",
                  color: "white",
                  textDecoration: "none",
                }}
              >
                View PDF
              </a>

              <button
                onClick={() =>
                  setConfirmModal({
                    type: "favorite",
                    result,
                  })
                }
                style={{
                  background: "none",
                  border: "none",
                  color: "#ef4444",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >
                <FaHeart />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
)}
      <div
  style={{
  position: "sticky",
  top: 0,
  zIndex: 2000,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "30px",
  padding: "14px 20px",
  borderBottom: "1px solid #1e293b",
  background:
  "rgba(15, 23, 42, 0.45)",
backdropFilter: "blur(14px)",
WebkitBackdropFilter:
  "blur(14px)",
  backdropFilter: "blur(10px)",
}}
>
  
<h2
  onClick={() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }}
  style={{
  color: "white",
  fontSize: "28px",
  margin: 0,
  cursor: "pointer",
  display: "inline-block",
  lineHeight: "1.1",
  background:
    "linear-gradient(to right, #c084fc, #60a5fa)",
  backgroundRepeat: "no-repeat",
  backgroundSize: "100% 3px",
  backgroundPosition: "0 100%",
}}
>
  ResultNotify
</h2>

  <button
    onClick={() => setMenuOpen(true)}
    style={{
      background: "none",
      border: "none",
      color: "white",
      fontSize: "28px",
      cursor: "pointer",
    }}
  >
    <FaBars />
  </button>
  
  <>
  <div
    onClick={() => setMenuOpen(false)}
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backgroundColor: menuOpen
        ? "rgba(0,0,0,0.5)"
        : "rgba(0,0,0,0)",
      zIndex: 998,
      opacity: menuOpen ? 1 : 0,
      pointerEvents: menuOpen
        ? "auto"
        : "none",
      transition: "0.25s ease",
    }}
  />

  <div
    ref={menuRef}
    style={{
      position: "fixed",
      top: 0,
      right: 0,
      width: "280px",
      height: "100%",
      backgroundColor: "#111827",
      padding: "30px 20px",
      zIndex: 999,
      boxShadow:
        "-5px 0 20px rgba(0,0,0,0.4)",

      transition: "all 0.25s ease",

      transform: menuOpen
        ? "translateX(0)"
        : "translateX(100%)",

      opacity: menuOpen ? 1 : 0,
    }}
  >  
    
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "40px",
        }}
      >
        <h2 style={{ color: "white", margin: 0 }}>
          Menu
        </h2>

        <button
          onClick={() => setMenuOpen(false)}
          style={{
            background: "none",
            border: "none",
            color: "white",
            fontSize: "24px",
            cursor: "pointer",
          }}
        >
          <FaTimes />
        </button>
      </div>

      <div
  style={{
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100%",
  }}
>
  <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
    
    <button
  style={menuButtonStyle}
  onClick={() => {
    setNotificationModal(true);
    setMenuOpen(false);
  }}
>
  Notifications
</button>

    <button
    style={menuButtonStyle}
    onClick={() => {
      setDashboardModal(true);
      setMenuOpen(false);
      }}
      >
        Student Dashboard
        </button>

    <button
  style={menuButtonStyle}
  onClick={() => {
    setSavedModal(true);
    setMenuOpen(false);
  }}
>
  Saved Results
</button>
    {!user && (
  <GoogleLogin
  onSuccess={(credentialResponse) => {
  const decoded = jwtDecode(
    credentialResponse.credential
  );

  const loggedInUser = {
    name: decoded.name,
    email: decoded.email,
    picture: decoded.picture,
  };

  setUser(loggedInUser);
  localStorage.setItem(
  "user",
  JSON.stringify(loggedInUser)
);
  setSubscriptionMessage("");
  setMessageType("");
  setMenuOpen(false);
}}/>
)}
{user && (
  <div
    style={{
      color: "white",
      fontSize: "14px",
      padding: "10px",
      backgroundColor: "#1e293b",
      borderRadius: "10px",
      border: "1px solid #334155",
    }}
  >
    Logged in as:
    <br />
    <strong>{user.email}</strong>
  </div>
)}
{user && (
  <button
    onClick={() => {
      setUser(null);
      localStorage.removeItem("user");
      setSavedResults([]);
      setSubscriptions([]);
      setMenuOpen(false);
    }}
    style={{
      backgroundColor: "#a21c1c",
      color: "white",
      border: "none",
      padding: "12px",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "15px",
      marginTop: "10px",
    }}
  >
    Logout
  </button>
)}

  </div>

</div>
    </div>
    
  </>
  
</div>
      <h1
        style={{
          textAlign: "center",
          fontSize: "52px",
          marginBottom: "30px",
        }}
      >
        ResultNotify
      </h1>
      <p
  style={{
    textAlign: "center",
    color: "#94a3b8",
    marginBottom: "30px",
  }}
>
  Mumbai University Result Tracking Platform
</p>

<div
  style={{
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "20px",
    marginBottom: "35px",
  }}
>
  {[
    {
      value: results.length,
      label: "Total Results",
    },
    {
      value: filteredResults.length,
      label: "Filtered Results",
    },
    {
      value: courses.length -1,
      label: "Total Courses",
    },
    {
      value: recentResults.length,
      label: "Recents",
    },
  ].map((card, index) => (
    <div
      key={index}
      style={{
        flex: "1 1 180px",
        maxWidth: "220px",
        minWidth:
        screenWidth < 768
        ? "140px" 
        : "180px",
        backgroundColor: "#111827",
        padding:
        screenWidth < 768 
        ? "14px" 
        : "18px",
        borderRadius: "16px",
        border: "1px solid #334155",
        textAlign: "center",
        transition: "0.25s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform =
          "translateY(-4px)";

        e.currentTarget.style.boxShadow =
          "0 10px 30px rgba(59,130,246,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform =
          "translateY(0px)";

        e.currentTarget.style.boxShadow =
          "none";
      }}
    >
      <h2
        style={{
          marginBottom: "10px",
          fontSize: "clamp(28px, 5vw, 40px)",
        }}
      >
        {card.value}
      </h2>

      <p
        style={{
          color: "#e2e8f0",
          fontSize: "clamp(15px, 2vw, 18px)",
        }}
      >
        {card.label}
      </p>
    </div>
  ))}
</div>
  
      <div
  style={{
    display: "flex",
    gap: "15px",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: "30px",
  }}
>
  <input
    type="text"
    placeholder="Search results..."
    value={search}
    onChange={(e) => {setSearch(e.target.value);setCurrentPage(1);}}
    style={{
  padding: "12px",
  width: "100%",
maxWidth: "900px",
  backgroundColor: "#1e293b",
  color: "white",
  border: "1px solid #475569",
  borderRadius: "10px",
  outline: "none",
  fontSize: "16px",
transition: "0.2s ease",
cursor: "pointer",
    }}
    onMouseEnter={(e) => {
  e.currentTarget.style.transform = "translateY(-2px)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform = "translateY(0px)";
}}
  />
  
  <select
    value={courseFilter}
    onChange={(e) => {setCourseFilter(e.target.value);setCurrentPage(1);}}
    style={{
  padding: "12px",
  width: "100%",
maxWidth: "350px",
  backgroundColor: "#1e293b",
  color: "white",
  border: "1px solid #475569",
  borderRadius: "10px",
  outline: "none",
  fontSize: "16px",
  appearance: "none",
  transition: "0.2s ease",
cursor: "pointer",
    }}
    onMouseEnter={(e) => {
  e.currentTarget.style.transform = "translateY(-2px)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform = "translateY(0px)";
}}
  >
    {courses.map((course, index) => (
      <option key={index} value={course}>
        {course}
      </option>
    ))}
  </select>

  <select
    value={semesterFilter}
    onChange={(e) => {setSemesterFilter(e.target.value);setCurrentPage(1);}}
    style={{
  padding: "12px",
  width: "100%",
maxWidth: "125px",
  backgroundColor: "#1e293b",
  color: "white",
  border: "1px solid #475569",
  borderRadius: "10px",
  outline: "none",
  fontSize: "16px",
  appearance: "none",
  transition: "0.2s ease",
cursor: "pointer",
    }}
    onMouseEnter={(e) => {
  e.currentTarget.style.transform = "translateY(-2px)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform = "translateY(0px)";
}}
  >
    <option value="All">All Semesters</option>
    <option value="I">Semester I</option>
    <option value="II">Semester II</option>
    <option value="III">Semester III</option>
    <option value="IV">Semester IV</option>
    <option value="V">Semester V</option>
    <option value="VI">Semester VI</option>
  </select>
  <select
  value={sortOption}
  onChange={(e) => {setSortOption(e.target.value);setCurrentPage(1);}}
  style={{
    padding: "12px",
    width: "100%",
maxWidth: "125px",
    backgroundColor: "#1e293b",
    color: "white",
    border: "1px solid #475569",
    borderRadius: "10px",
    outline: "none",
    fontSize: "16px",
    appearance: "none",
  transition: "0.2s ease",
cursor: "pointer",
    }}
    onMouseEnter={(e) => {
  e.currentTarget.style.transform = "translateY(-2px)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform = "translateY(0px)";
}}
>
  <option value="latest">Latest First</option>
  <option value="oldest">Oldest First</option>
  <option value="recent">Recent Only</option>
</select>
  <select
  value={yearFilter}
  onChange={(e) => { setYearFilter(e.target.value);setCurrentPage(1);}}
  style={{
  padding: "10px",
  width: "100%",
maxWidth: "125px",
  backgroundColor: "#1e293b",
  color: "white",
  border: "1px solid #475569",
  borderRadius: "10px",
  outline: "none",
  fontSize: "16px",
  appearance: "none",
  transition: "0.2s ease",
cursor: "pointer",
    }}
    onMouseEnter={(e) => {
  e.currentTarget.style.transform = "translateY(-2px)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform = "translateY(0px)";
}}
>
  <option value="All">All Years</option>
  <option value="2026">2026</option>
  <option value="2025">2025</option>
</select>

  <select
  value={patternFilter}
  onChange={(e) => { setPatternFilter(e.target.value); setCurrentPage(1);}}
  style={{
  padding: "10px",
  width: "100%",
maxWidth: "125px",
  backgroundColor: "#1e293b",
  color: "white",
  border: "1px solid #475569",
  borderRadius: "10px",
  outline: "none",
  fontSize: "16px",
  appearance: "none",
  transition: "0.2s ease",
cursor: "pointer",
    }}
    onMouseEnter={(e) => {
  e.currentTarget.style.transform = "translateY(-2px)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform = "translateY(0px)";
}}
>
  {patterns.map((pattern, index) => (
  <option key={index} value={pattern}>
    {pattern}
  </option>
))}
</select>
  <button
    onClick={resetFilters}
    style={{
      padding: "12px 18px",
      backgroundColor: "#7c3aed",
      color: "white",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "15px",
      transition: "0.2s ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform =
        "translateY(-2px)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform =
        "translateY(0px)";
    }}
  >
    Reset Filters
  </button>
</div>

     <div
  style={{
    display: "flex",
    gap: "10px",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: "20px",
    marginTop: "1px",
  }}
>
  
{!user && (
  <p>Please login first to manage notifications</p>
)}

  <button
  onClick={() => {
    if (!user) {
      
      return;
    }
    if (
      courseFilter === "All" ||
      semesterFilter === "All"
    ) {
      toast.error("Please select course and semester");
      return;
    }
    subscribeToResults(
      courseFilter,
      semesterFilter
    );
  }}
    style={{
      padding: "12px 18px",
      backgroundColor: "#00319c",
      color: "white",
      border: "none",
      borderRadius: "10px",
      cursor: "pointer",
      fontSize: "16px",
    transition: "0.2s ease",
    }}
    onMouseEnter={(e) => {
  e.currentTarget.style.transform = "translateY(-2px)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform = "translateY(0px)";
}}
  >
    Subscribe
  </button>
</div> 
{subscriptionMessage && (
  <p
    style={{
      textAlign: "center",
      color: messageType === "error" ? "#ef4444" : "#22c55e",
      marginBottom: "20px",
    }}
  >
    {subscriptionMessage}
  </p>
)}
<h5 style={{ textAlign: "center",color: "#94a3b8", marginBottom: "20px" }}>
  {filteredResults.length} Results Found
</h5>
      {filteredResults.length === 0 && (
        <div
  style={{
    textAlign: "center",
    marginTop: "50px",
    color: "#94a3b8",
  }}
>
  <h2>No Results Found</h2>
  <p>Try changing filters or search keywords.</p>
</div>
        )}
      {paginatedResults.map((result, index) => (
  <ResultCard
    key={result._id || index}
    result={result}
    savedResults={savedResults}
    saveFavorite={saveFavorite}
  />
))}
      <div
  style={{
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "15px",
    marginTop: "30px",
    marginBottom: "40px",
    flexWrap: "wrap",
  }}
>
  <button
    onClick={() =>
      setCurrentPage((prev) => Math.max(prev - 1, 1))
    }
    disabled={currentPage === 1}
    style={{
      padding: "10px 18px",
      backgroundColor: "#be6d0f",
      color: "white",
      border: "none",
      borderRadius: "8px",
      opacity: currentPage === 1 ? 0.5 : 1,
    transition: "0.2s ease",
cursor: "pointer",
    }}
    onMouseEnter={(e) => {
  e.currentTarget.style.transform = "translateY(-2px)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform = "translateY(0px)";
}}
  >
    Previous
  </button>

  <span style={{ fontSize: "18px", fontWeight: "bold" }}>
    Page {currentPage} of {totalPages}
  </span>

  <button
    onClick={() =>
      setCurrentPage((prev) =>
        Math.min(prev + 1, totalPages)
      )
    }
    disabled={currentPage === totalPages}
    style={{
      padding: "10px 18px",
      backgroundColor: "#00319c",
      color: "white",
      border: "none",
      borderRadius: "8px",
      opacity: currentPage === totalPages ? 0.5 : 1,
    transition: "0.2s ease",
cursor: "pointer",
    }}
    onMouseEnter={(e) => {
  e.currentTarget.style.transform = "translateY(-2px)";
}}

onMouseLeave={(e) => {
  e.currentTarget.style.transform = "translateY(0px)";
}}
  >
    Next
  </button>
</div>
<Footer />
        </div>
  </>
);
}

export default App;