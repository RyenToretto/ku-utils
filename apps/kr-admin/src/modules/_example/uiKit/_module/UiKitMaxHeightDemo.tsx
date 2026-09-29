import SimpleExampleList from '@/modules/_example/simpleExample/_module/SimpleExampleList';

export default function UiKitMaxHeightDemo() {
  return (
    <div
      className="page-ui-kit-max-height"
      style={{ height: '100%' }}
    >
      <SimpleExampleList
        pageClassName="page-ui-kit-max-height"
        fillViewportLayout
      />
    </div>
  );
}
