import UrlForm from "./UrlForm";
import TextForm from "./TextForm";
import PhoneForm from "./PhoneForm";
import SmsForm from "./SmsForm";
import EmailForm from "./EmailForm";
import WifiForm from "./WifiForm";
import VCardForm from "./VCardForm";
import WhatsAppForm from "./WhatsAppForm";
import UpiForm from "./UpiForm";

export const formsByType = {
  url: UrlForm,
  text: TextForm,
  phone: PhoneForm,
  sms: SmsForm,
  email: EmailForm,
  wifi: WifiForm,
  vcard: VCardForm,
  whatsapp: WhatsAppForm,
  upi: UpiForm,
};
