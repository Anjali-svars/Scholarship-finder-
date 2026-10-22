"""
Data Service managing scholarship dataset, in-memory repository, and persistence.
"""
import json
import os
from typing import List, Dict, Any, Optional

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'scholarships_seed.json')

class DataService:
    def __init__(self, data_path: str = DATA_PATH):
        self.data_path = data_path
        self._scholarships: List[Dict[str, Any]] = []
        self.load_data()

    def load_data(self):
        if os.path.exists(self.data_path):
            with open(self.data_path, 'r', encoding='utf-8') as f:
                self._scholarships = json.load(f)
        else:
            self._scholarships = []

    def get_all(self) -> List[Dict[str, Any]]:
        return list(self._scholarships)

    def get_by_id(self, sch_id: str) -> Optional[Dict[str, Any]]:
        for s in self._scholarships:
            if s.get('id') == sch_id:
                return s
        return None

    def add_scholarship(self, data: Dict[str, Any]) -> Dict[str, Any]:
        self._scholarships.append(data)
        self.save_data()
        return data

    def update_scholarship(self, sch_id: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for i, s in enumerate(self._scholarships):
            if s.get('id') == sch_id:
                self._scholarships[i].update(data)
                self.save_data()
                return self._scholarships[i]
        return None

    def delete_scholarship(self, sch_id: str) -> bool:
        initial_len = len(self._scholarships)
        self._scholarships = [s for s in self._scholarships if s.get('id') != sch_id]
        if len(self._scholarships) < initial_len:
            self.save_data()
            return True
        return False

    def save_data(self):
        os.makedirs(os.path.dirname(self.data_path), exist_ok=True)
        with open(self.data_path, 'w', encoding='utf-8') as f:
            json.dump(self._scholarships, f, indent=2)
