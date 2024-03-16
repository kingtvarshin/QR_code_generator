'use client';
import { Input, Button } from "@material-tailwind/react";
import React,{ useState } from "react";
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Dialog,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Radio
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
    // console.log(props)
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
      // console.log(qr_value)
    }
    catch(err) {
      setValue("www.google.com")
      // console.log('err',err)
    }
    
  }

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    setOpen((cur) => !cur)
    set_Value("")
  };

  var svg_value = ""
  function getSvg(node){
    console.log("getting_node")
    svg_value = node
    // console.log(svg_value)
  }


  const [input_value, set_Value] = useState(null)
  function on_filename_Change(event) {
    try {
      set_Value(event.target.value)
      console.log(input_value)
    }
    catch(err) {
      setValue("")
      // console.log('err',err)
    }
    
  }
  function downloadProcess(){
    console.log(input_value.trim() === "")
    if (input_value.trim() === ""){
      console.log("Enter_file_name")
      return ""
    }
    console.log('downloading in progress...');
    console.log(svg_value)
    handleOpen()
    return "";
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
        <div className="m-2">
          <Button variant="gradient" className="flex items-center gap-3" onClick={handleOpen}>
            <svg 
              width="30px" 
              height="30px" 
              viewBox="0 0 28 27" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              ref={node => {
                if (node){
                getSvg(node)
              }}}
            >
              <path 
                d="M8 22.0002H16C18.8284 22.0002 20.2426 22.0002 21.1213 21.1215C22 20.2429 22 18.8286 22 16.0002V15.0002C22 12.1718 22 10.7576 21.1213 9.8789C20.3529 9.11051 19.175 9.01406 17 9.00195M7 9.00195C4.82497 9.01406 3.64706 9.11051 2.87868 9.87889C2 10.7576 2 12.1718 2 15.0002L2 16.0002C2 18.8286 2 20.2429 2.87868 21.1215C3.17848 21.4213 3.54062 21.6188 4 21.749" 
                stroke="#ffffff" 
              />
              <path 
                d="M12 2L12 15M12 15L9 11.5M12 15L15 11.5" 
                stroke="#ffffff"
              />
            </svg>
          DOWNLOAD
        </Button>
        <Dialog
          size="lg"
          open={open}
          handler={handleOpen}
          className="bg-transparent shadow-none"
        >
          <Card className="mx-auto w-full max-w-[24rem]">
            <CardBody className="flex flex-col gap-4">
              <Typography variant="h4" color="blue-gray">
                Download QR Code
              </Typography>
              <Typography className="-mb-2" variant="h6">
                File Name
              </Typography>
              <Input label="File Name" size="lg" onChange={on_filename_Change}/>
              <Typography className="-mb-2" variant="h6">
              Image Format
              </Typography>
              <div className="-ml-2.5 -mt-3">
                <Radio name="img_fmt" label="PNG" defaultChecked />
                <Radio name="img_fmt" label="SVG" />
              </div>
              <Typography className="-mb-2" variant="h6">
              Image Size
              </Typography>
              <div className="-ml-2.5 -mt-3">
                <Radio name="img_size" label="100px" />
                <Radio name="img_size" label="1000px" defaultChecked />
              </div>
            </CardBody>
            <CardFooter className="pt-0 flex m-2">
              <Button className="m-2" variant="outlined" onClick={handleOpen} fullWidth>
                Cancel
              </Button>
              <Button className="m-2" variant="gradient" onClick={downloadProcess} fullWidth>
                Download
              </Button>
            </CardFooter>
          </Card>
        </Dialog>
      </div>
      </div>
    </div>
    
  );
}