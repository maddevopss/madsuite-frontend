import { useState,  useState, useEffect } from "react";
import { Button, Card, Input, Modal, Loader } from "../../components/ui";
import api from "../../api/api";
import { useToast } from "../../ToastContext";

export default function CalendarIntegration({ onAddEntry }) {
  const [isOpen, setIsOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feedUrl, setFeedUrl] = useState("");
  const { showToast } = useToast();

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/calendar/events");
      if (res.data?.message === "CALENDAR_NO_URL") {
        setEvents([]);
      } else {
        setEvents(res.data?.data || []);
      }
    } catch (err) {
      console.error(err);
      showToast("Erreur lors du chargement du calendrier", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadEvents();
    }
  }, [isOpen]);

  const saveFeedUrl = async () => {
    try {
      setLoading(true);
      await api.put("/calendar/feed", { ical_feed_url: feedUrl });
      showToast("URL sauvegardée", "success");
      loadEvents();
    } catch (err) {
      showToast("Erreur lors de la sauvegarde", "error");
      setLoading(false);
    }
  };

  const handleUseEvent = (evt) => {
    const s = new Date(evt.start);
    const e = new Date(evt.end);
    onAddEntry({
      description: evt.summary,
      start_time: s.toISOString(),
      end_time: e.toISOString(),
    });
    setIsOpen(false);
  };

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        Intégration Calendrier
      </Button>

      <Modal show={isOpen} title="Calendrier iCal" onClose={() => setIsOpen(false)}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Input 
              placeholder="Collez le lien iCal (secret) de Google/Outlook" 
              value={feedUrl} 
              onChange={(e) => setFeedUrl(e.target.value)}
              style={{ flex: 1 }}
            />
            <Button variant="primary" onClick={saveFeedUrl}>Sauvegarder</Button>
          </div>

          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
            Cette intégration va lire votre calendrier pour la semaine en cours.
          </p>

          {loading ? (
            <Loader />
          ) : events.length === 0 ? (
            <div style={{ padding: "1rem", textAlign: "center", color: "var(--text-muted)" }}>
              Aucun événement trouvé ou lien non configuré.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "400px", overflowY: "auto" }}>
              {events.map((evt, idx) => (
                <Card key={idx} style={{ padding: "0.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>{evt.summary}</strong>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                      {new Date(evt.start).toLocaleString()} - {new Date(evt.end).toLocaleTimeString()}
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => handleUseEvent(evt)}>
                    Ajouter
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
