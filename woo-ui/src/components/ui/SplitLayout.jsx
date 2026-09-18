/**
 * The "form on the left, results/errors on the right" pattern used by every
 * action page. Replaces the hand-written
 *   grid grid-cols-1 gap-5 ${hasSidebar ? "xl:grid-cols-2" : "max-w-2xl"}
 * that used to be duplicated (and easy to get out of sync) in every file:
 * pass `sidebar` only when there's something to show and the collapse to a
 * single readable column happens automatically.
 */
function SplitLayout({ children, sidebar }) {
  const hasSidebar = Boolean(sidebar);

  return (
    <div
      className={`grid grid-cols-1 gap-5 ${
        hasSidebar ? "xl:grid-cols-2 items-start" : "max-w-2xl"
      }`}
    >
      <div className="space-y-5">{children}</div>
      {hasSidebar && <div className="space-y-4">{sidebar}</div>}
    </div>
  );
}

export default SplitLayout;
