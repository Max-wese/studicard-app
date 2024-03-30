// Holt die b_kennung des Benutzers aus dem lokalen Speicher.
function getB_kennung() {
  const kennungString = localStorage.getItem('user');
  const userKennung = JSON.parse(kennungString);
  return userKennung?.b_kennung;
}
export default getB_kennung;