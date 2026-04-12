const SelectField = ({ label, value, onChange, options, required }) => (
  <div style={{ marginBottom: "16px" }}>
    <label
      style={{
        display: "block",
        fontSize: "14px",
        fontWeight: "600",
        color: "#333",
        marginBottom: "4px",
      }}
    >
      {label}
      {required && <span style={{ color: "#c33", marginLeft: "4px" }}>*</span>}
    </label>
    <select
      value={value}
      onChange={onChange}
      required={required}
      style={{
        width: "100%",
        padding: "8px 12px",
        border: "1px solid #ddd",
        borderRadius: "4px",
        fontSize: "14px",
        fontFamily: "inherit",
        backgroundColor: "#fff",
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
    >
      <option value="">Select {label.toLowerCase()}</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.name}
        </option>
      ))}
    </select>
  </div>
);

export default SelectField;
