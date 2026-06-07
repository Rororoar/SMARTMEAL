import { useEffect, useMemo, useState } from "react";
import { mealPlanApi } from "../api/client";
import { Icon } from "../components/Icons";

const categoryEmoji = {
  Fruits: "🍎",
  Vegetables: "🥦",
  "Prepared Foods": "🍞",
  "Asian Foods": "🍜",
  Drinks: "🥛",
  Pantry: "🧂"
};

const ingredientEmojiMatchers = [
  { pattern: /(grape|grapes)/, emoji: "🍇" },
  { pattern: /(melon|cantaloupe)/, emoji: "🍈" },
  { pattern: /(watermelon)/, emoji: "🍉" },
  { pattern: /(orange|mandarin)/, emoji: "🍊" },
  { pattern: /\blime\b/, emoji: "🍋‍🟩" },
  { pattern: /(lemon)/, emoji: "🍋" },
  { pattern: /(banana)/, emoji: "🍌" },
  { pattern: /(pineapple)/, emoji: "🍍" },
  { pattern: /(mango)/, emoji: "🥭" },
  { pattern: /(apple)/, emoji: "🍎" },
  { pattern: /(pear)/, emoji: "🍐" },
  { pattern: /(peach)/, emoji: "🍑" },
  { pattern: /(cherry|cherries)/, emoji: "🍒" },
  { pattern: /(strawberry|strawberries)/, emoji: "🍓" },
  { pattern: /(blueberry|blueberries)/, emoji: "🫐" },
  { pattern: /(kiwi)/, emoji: "🥝" },
  { pattern: /(olive|olives)/, emoji: "🫒" },
  { pattern: /(coconut)/, emoji: "🥥" },
  { pattern: /(avocado)/, emoji: "🥑" },
  { pattern: /(eggplant|aubergine)/, emoji: "🍆" },
  { pattern: /(potato)/, emoji: "🥔" },
  { pattern: /(carrot)/, emoji: "🥕" },
  { pattern: /(corn)/, emoji: "🌽" },
  { pattern: /(chili|chilli)/, emoji: "🌶️" },
  { pattern: /(bell pepper|capsicum|pepper)/, emoji: "🫑" },
  { pattern: /(cucumber)/, emoji: "🥒" },
  { pattern: /(lettuce|spinach|cabbage)/, emoji: "🥬" },
  { pattern: /(broccoli)/, emoji: "🥦" },
  { pattern: /(garlic)/, emoji: "🧄" },
  { pattern: /(onion|shallot)/, emoji: "🧅" },
  { pattern: /(peanut|peanuts)/, emoji: "🥜" },
  { pattern: /(bean|beans)/, emoji: "🫘" },
  { pattern: /(chestnut)/, emoji: "🌰" },
  { pattern: /(ginger)/, emoji: "🫚" },
  { pattern: /(pea|peas)/, emoji: "🫛" },
  { pattern: /(mushroom)/, emoji: "🍄‍🟫" },
  { pattern: /(radish)/, emoji: "🫜" },
  { pattern: /(bread|loaf|toast)/, emoji: "🍞" },
  { pattern: /(croissant)/, emoji: "🥐" },
  { pattern: /(baguette)/, emoji: "🥖" },
  { pattern: /(flatbread|naan|roti|tortilla)/, emoji: "🫓" },
  { pattern: /(pretzel)/, emoji: "🥨" },
  { pattern: /(bagel)/, emoji: "🥯" },
  { pattern: /(pancake)/, emoji: "🥞" },
  { pattern: /(waffle)/, emoji: "🧇" },
  { pattern: /(cheese)/, emoji: "🧀" },
  { pattern: /(meat|lamb|mutton)/, emoji: "🍖" },
  { pattern: /(chicken|turkey)/, emoji: "🍗" },
  { pattern: /(beef|steak)/, emoji: "🥩" },
  { pattern: /(bacon)/, emoji: "🥓" },
  { pattern: /(egg)/, emoji: "🥚" },
  { pattern: /(butter)/, emoji: "🧈" },
  { pattern: /(salt|seasoning|spice)/, emoji: "🧂" },
  { pattern: /(canned|can of|tomato paste|beans in can)/, emoji: "🥫" },
  { pattern: /(pasta|spaghetti|macaroni|penne)/, emoji: "🍝" },
  { pattern: /(rice)/, emoji: "🍚" },
  { pattern: /(curry)/, emoji: "🍛" },
  { pattern: /(noodle|ramen|udon|soba)/, emoji: "🍜" },
  { pattern: /(sweet potato)/, emoji: "🍠" },
  { pattern: /(skewer)/, emoji: "🍢" },
  { pattern: /(salmon|sushi)/, emoji: "🍣" },
  { pattern: /(shrimp|prawn)/, emoji: "🍤" },
  { pattern: /(dumpling|gyoza|wonton)/, emoji: "🥟" },
  { pattern: /(milk|almond milk|oat milk)/, emoji: "🥛" },
  { pattern: /(coffee)/, emoji: "☕" },
  { pattern: /(tea)/, emoji: "🍵" },
  { pattern: /(juice)/, emoji: "🧃" },
  { pattern: /(smoothie|soda|drink)/, emoji: "🥤" },
  { pattern: /(honey)/, emoji: "🍯" },
  { pattern: /(oil)/, emoji: "🫒" },
  { pattern: /(yogurt|yoghurt)/, emoji: "🥛" },
  { pattern: /(quinoa|oats|grain|flour)/, emoji: "🌾" }
];

function ingredientEmoji(name) {
  const value = String(name || "").toLowerCase();
  const match = ingredientEmojiMatchers.find((item) => item.pattern.test(value));

  if (match?.emoji) {
    return match.emoji;
  }

  if (/(cilantro|coriander|parsley|basil|mint|thyme|oregano|rosemary|dill|chive|herb|greens|scallion|spring onion)/.test(value)) {
    return "🥬";
  }

  if (/(fruit|jam|raisin)/.test(value)) {
    return "🍎";
  }

  if (/(vegetable|veg|zucchini|courgette|celery|bok choy|okra|leek|asparagus)/.test(value)) {
    return "🥦";
  }

  if (/(lentil|chickpea|legume)/.test(value)) {
    return "🫘";
  }

  if (/(tofu|tempeh)/.test(value)) {
    return "🥗";
  }

  if (/(fish|seafood|anchovy|sardine)/.test(value)) {
    return "🐟";
  }

  if (/(sausage|ham|mince|meatball)/.test(value)) {
    return "🍖";
  }

  if (/(cream|custard)/.test(value)) {
    return "🥛";
  }

  if (/(sugar|syrup|sweet)/.test(value)) {
    return "🍯";
  }

  if (/(vinegar|mustard|ketchup|mayo|mayonnaise|paste|stock|broth|soup)/.test(value)) {
    return "🧂";
  }

  if (/(cracker|biscuit|cereal)/.test(value)) {
    return "🍞";
  }

  return "🥬";
}

function categoryForItem(item) {
  const name = String(item.name || "").toLowerCase();

  if (
    /(apple|banana|berry|berries|orange|lemon|lime|grape|grapes|mango|pineapple|kiwi|pear|peach|cherry|avocado|olive|coconut|melon|watermelon)/.test(
      name
    )
  ) {
    return "Fruits";
  }

  if (
    /(lettuce|spinach|broccoli|pepper|tomato|carrot|cucumber|onion|garlic|potato|corn|bean|beans|pea|peas|mushroom|ginger|cabbage|eggplant|radish)/.test(
      name
    )
  ) {
    return "Vegetables";
  }

  if (/(rice|noodle|ramen|udon|soba|dumpling|gyoza|wonton|curry|sushi|shrimp)/.test(name)) {
    return "Asian Foods";
  }

  if (/(milk|yogurt|coffee|tea|juice|smoothie|drink|soda)/.test(name)) {
    return "Drinks";
  }

  if (
    /(bread|pasta|cheese|chicken|turkey|beef|steak|egg|bacon|butter|bagel|waffle|pancake|flatbread|naan|roti|tortilla)/.test(
      name
    )
  ) {
    return "Prepared Foods";
  }

  return "Pantry";
}

function groupItems(items) {
  return items.reduce((acc, item) => {
    const category = categoryForItem(item);
    acc[category] = acc[category] || [];
    acc[category].push(item);
    return acc;
  }, {});
}

export default function Grocery() {
  const [mealPlan, setMealPlan] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    mealPlanApi
      .current()
      .then((data) => setMealPlan(data.mealPlan))
      .catch((err) => setError(err.message));
  }, []);

  async function toggleItem(item) {
    const data = await mealPlanApi.toggleGrocery(mealPlan._id, item._id, !item.purchased);
    setMealPlan(data.mealPlan);
  }

  const groupedItems = useMemo(() => groupItems(mealPlan?.groceryItems || []), [mealPlan]);
  const totalItems = mealPlan?.groceryItems?.length || 0;
  const checkedItems = mealPlan?.groceryItems?.filter((item) => item.purchased).length || 0;

  return (
    <main className="page-surface">
      <section className="panel-shell">
        <div className="page-heading">
          <div>
            <h2>Grocery List</h2>
            <p className="page-subtitle">
              {checkedItems} of {totalItems} items checked
            </p>
          </div>
          <button type="button" className="secondary-button print-button" onClick={() => window.print()}>
            <Icon name="print" className="mini-icon" />
            Print List
          </button>
        </div>

        {error && <p className="form-error inline-message">{error}</p>}
        {!mealPlan && <p className="empty-state">Generate a weekly plan first.</p>}

        {mealPlan?.groceryItems?.length > 0 && (
          <section className="grocery-grid">
            {Object.entries(groupedItems).map(([category, items]) => (
              <article className="grocery-card" key={category}>
                <div className="grocery-card-head">
                  <h3>
                    <span>{categoryEmoji[category] || "🛒"}</span> {category}
                  </h3>
                  <span>{items.length}</span>
                </div>
                <div className="grocery-card-body">
                  {items.map((item) => (
                    <label className={`grocery-item-row ${item.purchased ? "is-purchased" : ""}`} key={item._id}>
                      <input type="checkbox" checked={item.purchased} onChange={() => toggleItem(item)} />
                      <span className="grocery-item-copy">
                        <strong>
                          <span>{ingredientEmoji(item.name)}</span> {item.name}
                        </strong>
                        <small>
                          {Number(item.amount || 0).toFixed(item.amount % 1 ? 1 : 0)} {item.unit}
                        </small>
                        {item.sourceRecipes?.length > 1 && <em>Reusable</em>}
                      </span>
                    </label>
                  ))}
                </div>
              </article>
            ))}
          </section>
        )}
      </section>
    </main>
  );
}
