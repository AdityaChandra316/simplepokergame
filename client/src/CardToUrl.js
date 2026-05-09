function CardToUrl(card) {
  const suit = card % 4;
  const rank = (card - suit) / 4;
  return `/cards/row-${suit + 1}-column-${rank == 12 ? 1 : rank + 2}.png`;
}

export default CardToUrl;
