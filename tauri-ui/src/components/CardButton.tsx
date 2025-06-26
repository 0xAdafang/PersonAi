import { useNavigate } from "react-router-dom";

interface CardButtonProps {
  description: string;
  image: string;
  to?: string;
}

const CardButton = ({ description, image, to }: CardButtonProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center w-full max-w-md text-center">
      <div
        className="relative min-h-[180px] w-full rounded-xl overflow-hidden shadow-md group cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:ring-2 hover:ring-catppuccin-mauve hover:ring-offset-2 hover:ring-offset-transparent"
        style={{
          backgroundImage: `url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        onClick={() => to && navigate(to)}
      >
        <div className="absolute inset-0 p-6 flex items-center justify-between">
        </div>
      </div>
      <p className="text-sm text-gray-400 mt-2">{description}</p>
    </div>
  );
};


export default CardButton;
