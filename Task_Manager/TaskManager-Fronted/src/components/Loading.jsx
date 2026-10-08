export default function Loading({
  text = "Loading..."
}) {

  return (

    <div
      className="loading-box"
      role="status"
    >

      <div className="spinner"></div>

      <span>{text}</span>

    </div>
  );
}