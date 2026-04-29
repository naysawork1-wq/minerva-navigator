import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="bottom-right"
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-[#0A1628] group-[.toaster]:border group-[.toaster]:border-[#E4DFD3] group-[.toaster]:shadow-lg group-[.toaster]:rounded-sm",
          description: "group-[.toast]:text-[#7A8499]",
          actionButton: "group-[.toast]:bg-[#0DA882] group-[.toast]:text-white",
          cancelButton: "group-[.toast]:bg-[#F2EFE8] group-[.toast]:text-[#3D4A5F]",
          closeButton: "group-[.toast]:bg-white group-[.toast]:border group-[.toast]:border-[#E4DFD3] group-[.toast]:text-[#3D4A5F] group-[.toast]:opacity-100",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
