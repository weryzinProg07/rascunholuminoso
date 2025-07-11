import React from 'react';
import { MapPin, Phone, Mail, Clock, Facebook } from 'lucide-react';

const Contact = () => {
  const contactInfo = [
    {
      icon: Phone,
      title: "WhatsApp",
      info: "+244 949 157 934",
      link: "https://wa.me/244949157934",
      color: "bg-green-500"
    },
    {
      icon: Mail,
      title: "Email",
      info: "rascunholuminoso@gmail.com",
      link: "mailto:rascunholuminoso@gmail.com",
      color: "bg-blue-500"
    },
    {
      icon: MapPin,
      title: "Endereço",
      info: "Humpata / Rua do hospital municipal",
      link: "#",
      color: "bg-pink-500"
    },
    {
      icon: Clock,
      title: "Horário",
      info: "Seg-Sex: 07:00-17:30 | Sáb: 07:00-14:00",
      link: "#",
      color: "bg-orange-500"
    }
  ];

  return (
    <section id="contato" className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            Entre em <span className="text-orange-500">Contato</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Estamos prontos para atender você! Entre em contato conosco através dos canais abaixo
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {contactInfo.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div key={index} className="text-center group">
                <div className={`${item.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                {item.link !== "#" ? (
                  <a 
                    href={item.link}
                    className="text-gray-300 hover:text-orange-500 transition-colors"
                    target={item.link.startsWith('http') ? '_blank' : '_self'}
                    rel={item.link.startsWith('http') ? 'noopener noreferrer' : ''}
                  >
                    {item.info}
                  </a>
                ) : (
                  <p className="text-gray-300">{item.info}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Mapa/Localização */}
        <div className="bg-gray-800 rounded-2xl p-8 mb-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">Nossa Localização</h3>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Estamos localizados na Humpata, próximo ao hospital municipal. 
                Nosso container laranja é facilmente identificável na rua!
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-orange-500" />
                  <span className="text-gray-300">Humpata / Rua do hospital municipal</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-green-500" />
                  <span className="text-gray-300">+244 949 157 934</span>
                </div>
              </div>
            </div>
            <div className="bg-gray-700 rounded-xl overflow-hidden">
              <img 
                src="/lovable-uploads/873aed8f-1846-43a9-9568-b9f29fefe083.png" 
                alt="Container Laranja Rascunho Luminoso" 
                className="w-full h-auto object-cover"
              />
              <div className="p-4 text-center bg-gradient-to-r from-orange-500 to-orange-600">
                <h4 className="font-semibold">Container Laranja - Fácil de Encontrar!</h4>
                <p className="text-sm text-orange-100">Rua do hospital municipal, Humpata</p>
              </div>
            </div>
          </div>
        </div>

        {/* Redes Sociais */}
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-6">Siga-nos nas Redes Sociais</h3>
          <div className="flex justify-center space-x-4">
            <a 
              href="https://www.facebook.com/rascunholuminoso" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 w-12 h-12 rounded-full flex items-center justify-center transition-colors"
            >
              <Facebook className="w-6 h-6 text-white" />
            </a>
            <a 
              href="https://www.facebook.com/rascunholuminoso"
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-300 hover:text-blue-400 self-center transition-colors"
            >
              Rascunho Luminoso
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
