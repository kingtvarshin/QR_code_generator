'use client';
import { Input } from "@material-tailwind/react";
import React,{ useState } from "react";
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import {
  LinkIcon,
  PhoneIcon,
} from "@heroicons/react/24/solid";
import { useQRCode } from 'next-qrcode';

export default function Home() {
  const { SVG } = useQRCode();
  const data = [
    {
      label: "URL",
      value: "URL",
      icon: LinkIcon,
      desc: `URL`,
    },
    {
      label: "Phone",
      value: "Phone",
      icon: PhoneIcon,
      desc: `Phone`,
    }
  ];

  function Qr_code(props){
    console.log(props)
    var qr_text = props.title
    if (props.title == ""){
      qr_text="www.google.com"
    }
    return (
      <SVG
        text= {qr_text}
        options={{
          margin: 2,
          width: 200,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        }}
      />
    );
  }
  
  const [qr_value, setValue] = useState("www.google.com")

  function onChange(event) {
    try {
      setValue(event.target.value)
      console.log(qr_value)
    }
    catch(err) {
      setValue("www.google.com")
      console.log(err)
    }
    
  }

  return (
    <div>
      <div>
        <Tabs value="URL">
          <TabsHeader>
            {data.map(({ label, value, icon }) => (
              <Tab key={value} value={value}>
                <div className="flex items-center gap-2">
                  {React.createElement(icon, { className: "w-5 h-5" })}
                  {label}
                </div>
              </Tab>
            ))}
          </TabsHeader>
          <TabsBody>
            {data.map(({ value, desc }) => (
              <TabPanel className="m-2 inline-grid object-center justify-items-center" key={value} value={value}>
                <div className="w-72">
                  <Input 
                    id={value}
                    color="blue" 
                    label={desc}
                    onChange={onChange}
                  />
                </div>
              </TabPanel>
            ))}
          </TabsBody>
        </Tabs>
      </div>
      <div className="w-full inline-grid place-items-center object-center h-64 m-2 justify-items-center">
        <div className="height_canvas">
          <Qr_code title={qr_value}/>
        </div>
      </div>
    </div>
    
  );
}
