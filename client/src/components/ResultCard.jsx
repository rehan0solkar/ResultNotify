import {
  FaHeart,
  FaRegHeart,
} from "react-icons/fa";
function ResultCard({
  result,
  savedResults,
  saveFavorite,
  results,
}) {
  const isSaved = Array.isArray(savedResults) &&
  Array.isArray(savedResults) &&
savedResults.some(
(item) =>
item &&
item.pdfUrl &&
item.pdfUrl === result.pdfUrl
)
  return (
    <div
      style={{
        backgroundColor: "#111827",
        border: "1px solid #334155",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "20px",
        maxWidth: "1000px",
        marginInline: "auto",
        boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform =
          "translateY(-4px)";
        e.currentTarget.style.boxShadow =
          "0 10px 25px rgba(37,99,235,0.35)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform =
          "translateY(0px)";
        e.currentTarget.style.boxShadow =
          "0 4px 12px rgba(0,0,0,0.25)";
      }}
    >
      <h2
        style={{
          marginBottom: "15px",
          fontSize: "16px",
          lineHeight: "1.4",
          wordBreak: "break-word",
        }}
      >
        {result.title}{" "}
(
  {results.filter(
    (r) => r.title === result.title
  ).length}
)
      </h2>

      <p
        style={{
          marginBottom: "10px",
          color: "#94a3b8",
        }}
      >
        Result Date: {result.date}
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
          marginTop: "18px",
          width: "100%",
          maxWidth: "420px",
          marginInline: "auto",
        }}
      >
        <a
          href={result.pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-block",
            padding: "10px 16px",
            backgroundColor: "#00319c",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            transition: "0.2s",
            cursor: "pointer",
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
          View PDF
        </a>

        <button
          onClick={() => saveFavorite(result)}
          style={{
            background: "none",
            border: "none",
            color: isSaved ? "#ef4444"
              : "#64748b",
            fontSize: "26px",
            cursor: "pointer",
            transition: "0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform =
              "scale(1.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform =
              "scale(1)";
          }}
        >
          { isSaved ? (
            <FaHeart />
          ) : (
            <FaRegHeart />
          )}
        </button>
      </div>
    </div>
  );
}

export default ResultCard;
