export function waLink(phone: string, text?: string) {
  const num = phone.replace(/[^0-9+]/g, "");
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const params = text ? `?text=${encodeURIComponent(text)}` : "";
  return isMobile
    ? `https://wa.me/${num}${params}`
    : `https://web.whatsapp.com/send?phone=${num}${text ? `&text=${encodeURIComponent(text)}` : ""}`;
}
