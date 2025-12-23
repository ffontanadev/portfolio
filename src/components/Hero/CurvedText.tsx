interface CurvedTextProps {
  text?: string;
  radius?: number;
}

const CurvedText = ({
  text = "I WANNA BE A HUMAN BEFORE I DO SOME ART",
  radius = 150
}: CurvedTextProps) => {
  const viewBoxSize = radius * 2 + 50;
  const center = viewBoxSize / 2;

  return (
    <>
      {/* Screen reader accessible text */}
      <span className="sr-only">{text}</span>

      {/* Visual curved text */}
      <svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden="true"
      >
        <defs>
          <path
            id="circlePath"
            d={`M ${center},${center} m -${radius},0 a ${radius},${radius} 0 1,1 ${radius * 2},0 a ${radius},${radius} 0 1,1 -${radius * 2},0`}
            fill="none"
          />
        </defs>
        <text
          fontSize="14"
          letterSpacing="3"
          fontWeight="500"
          fill="currentColor"
          className="text-gray-700"
        >
          <textPath href="#circlePath" startOffset="50%" textAnchor="middle">
            {text}
          </textPath>
        </text>
      </svg>
    </>
  );
};

export default CurvedText;
