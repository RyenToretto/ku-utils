import SimpleExampleList from '@/modules/_example/simpleExample/_module/SimpleExampleList';

export default function UiKitPanelDemo() {
  return (
    <div className="page-ui-kit-panel">
      <SimpleExampleList
        pageClassName="page-ui-kit-panel"
        filterFieldCount={4}
        filterButtonCount={2}
      />
    </div>
  );
}
