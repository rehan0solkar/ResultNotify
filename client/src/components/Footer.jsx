import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
} from "react-icons/fa";

function Footer() {
  return (
    <footer
      style={{
        marginTop: "80px",
        padding: "40px 20px",
        borderTop: "1px solid #1e293b",
        textAlign: "center",
        color: "#94a3b8",
      }}
    >
      <h3
        style={{
          color: "white",
          marginBottom: "10px",
        }}
      >
        ResultNotify © 2026
      </h3>

      <p style={{ marginBottom: "10px" }}>
        Built for Mumbai University Students
      </p>

      <p style={{ marginBottom: "25px" }}>
        By Rehan Solkar
      </p>

<div
  style={{
    display: "flex",
    justifyContent: "center",
    gap: "18px",
    flexWrap: "wrap",
  }}
>
  {[
    {
      icon: <FaGithub />,
      link: "https://github.com/rehan0solkar",
      color: "#cbd5e1",
    },
    {
      icon: <FaLinkedin />,
      link: "https://linkedin.com/in/rehan0solkar",
      color: "#0A66C2",
    },
    {
      icon: <FaEnvelope />,
      link: "mailto:rhnslkr@gmail.com",
      color: "#60a5fa",
    },
  ].map((social, index) => (
    <a
      key={index}
      href={social.link}
      target="_blank"
      rel="noreferrer"
      style={{
        width: "60px",
        height: "60px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#111827",
        border: "1px solid #334155",
        borderRadius: "16px",
        fontSize: "26px",
        color: social.color,
        textDecoration: "none",
        boxShadow:
          "0 8px 25px rgba(0,0,0,0.25)",
        transition: "0.25s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform =
          "translateY(-5px) scale(1.05)";

        e.currentTarget.style.boxShadow =
          "0 12px 30px rgba(59,130,246,0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform =
          "translateY(0px) scale(1)";

        e.currentTarget.style.boxShadow =
          "0 8px 25px rgba(0,0,0,0.25)";
      }}
    >
      {social.icon}
    </a>
  ))}
</div>
    </footer>
  );
}

export default Footer;