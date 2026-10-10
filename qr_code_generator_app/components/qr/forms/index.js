import UrlForm from "./UrlForm";
import TextForm from "./TextForm";
import PhoneForm from "./PhoneForm";
import SmsForm from "./SmsForm";
import EmailForm from "./EmailForm";
import WifiForm from "./WifiForm";
import VCardForm from "./VCardForm";

export const formsByType = {
  url: UrlForm,
  text: TextForm,
  phone: PhoneForm,
  sms: SmsForm,
  email: EmailForm,
  wifi: WifiForm,
  vcard: VCardForm,
};
