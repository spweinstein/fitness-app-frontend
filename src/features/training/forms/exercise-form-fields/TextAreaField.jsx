const TextAreaField = ({ label, name, value, onChange, rows = 3 }) => (
  <div style={{ marginBottom: "16px" }}>
    <label
      htmlFor={name}
      style={{
        display: "block",
        fontSize: "14px",
        fontWeight: "600",
        color: "#333",
        marginBottom: "4px",
      }}
    >
      {label}
    </label>
    <textarea
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      rows={rows}
      style={{
        width: "100%",
        padding: "8px 12px",
        border: "1px solid #ddd",
        borderRadius: "4px",
        fontSize: "14px",
        fontFamily: "inherit",
        resize: "vertical",
      }}
      onFocus={(e) => {
        e.target.style.outline = "none";
        e.target.style.borderColor = "#2196F3";
        e.target.style.boxShadow = "0 0 0 2px rgba(33, 150, 243, 0.2)";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "#ddd";
        e.target.style.boxShadow = "none";
      }}
    />
  </div>
);

export default TextAreaField;
