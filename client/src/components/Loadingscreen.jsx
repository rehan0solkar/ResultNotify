function LoadingScreen() {
  return (
    <div
      style={{
        backgroundColor: "#0f172a",
        minHeight: "100vh",
        padding: "40px 20px",
      }}
    >
      <style>
        {`
          @keyframes shimmer {
            0% {
              background-position: -1000px 0;
            }

            100% {
              background-position: 1000px 0;
            }
          }
        `}
      </style>

      <div
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            style={{
              backgroundColor: "#111827",
              border: "1px solid #334155",
              borderRadius: "14px",
              padding: "25px",
              marginBottom: "25px",
            }}
          >
            <div
              style={{
                height: "30px",
                width: "70%",
                borderRadius: "8px",
                marginBottom: "20px",
                background:
                  "linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)",
                backgroundSize: "1000px 100%",
                animation:
                  "shimmer 2s infinite linear",
              }}
            />

            <div
              style={{
                height: "20px",
                width: "40%",
                borderRadius: "8px",
                marginBottom: "25px",
                background:
                  "linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)",
                backgroundSize: "1000px 100%",
                animation:
                  "shimmer 2s infinite linear",
              }}
            />

            <div
              style={{
                height: "45px",
                width: "140px",
                borderRadius: "10px",
                background:
                  "linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%)",
                backgroundSize: "1000px 100%",
                animation:
                  "shimmer 2s infinite linear",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default LoadingScreen;